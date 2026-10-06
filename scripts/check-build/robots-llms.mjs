import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { headOf, htmlFiles, pageFileFor } from './seo.mjs';

/** Групи robots.txt: декілька `User-agent` поспіль — одна група. */
export function parseRobots(text) {
	const groups = [];
	let current = null;
	let lastWasAgent = false;
	for (const raw of text.split(/\r?\n/)) {
		const line = raw.replace(/#.*$/, '').trim();
		const idx = line.indexOf(':');
		if (!line || idx === -1) continue;
		const key = line.slice(0, idx).trim().toLowerCase();
		const value = line.slice(idx + 1).trim();
		if (key === 'user-agent') {
			if (!current || !lastWasAgent) groups.push((current = { agents: [], allow: [], disallow: [] }));
			current.agents.push(value.toLowerCase());
			lastWasAgent = true;
			continue;
		}
		lastWasAgent = false;
		if (current && key === 'allow') current.allow.push(value);
		if (current && key === 'disallow' && value) current.disallow.push(value);
	}
	return groups;
}

function rulesByAgent(groups) {
	const byAgent = new Map();
	for (const group of groups) {
		for (const agent of group.agents) {
			const rules = byAgent.get(agent) ?? { allow: [], disallow: [] };
			rules.allow.push(...group.allow);
			rules.disallow.push(...group.disallow);
			byAgent.set(agent, rules);
		}
	}
	return byAgent;
}

const TRAINING_AGENTS = ['gptbot', 'claudebot', 'ccbot', 'bytespider', 'google-extended', 'applebot-extended'];

function ruleMatches(rule, path) {
	const anchored = rule.endsWith('$');
	const body = (anchored ? rule.slice(0, -1) : rule)
		.split('*')
		.map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
		.join('.*');
	return new RegExp(`^${body}${anchored ? '$' : ''}`).test(path);
}

function decidingRule(rules, path) {
	const hits = [...rules.allow.map((rule) => ({ rule, allow: true })), ...rules.disallow.map((rule) => ({ rule, allow: false }))]
		.filter(({ rule }) => rule && ruleMatches(rule, path))
		.sort((a, b) => b.rule.length - a.rule.length || Number(b.allow) - Number(a.allow));
	return hits[0];
}

export function checkRobotsAndLlms(build, policy) {
	const problems = [];
	const robotsPath = join(build, 'robots.txt');

	if (existsSync(robotsPath) && !policy.hostRoot) {
		problems.push('robots.txt: сайт у підтеці — файл не діє (В§ 7.2)');
	} else if (existsSync(robotsPath)) {
		const agents = rulesByAgent(parseRobots(readFileSync(robotsPath, 'utf8')));
		const star = agents.get('*');
		const recorded = new Set((policy.blockedSearchAgents ?? []).map((agent) => agent.toLowerCase()));
		const hidden = htmlFiles(build)
			.filter((file) => headOf(readFileSync(file, 'utf8')).noindex)
			.map((file) => `/${file.slice(build.length + 1).replaceAll('\\', '/')}`.replace(/(index)?\.html$/, ''));
		for (const [agent, rules] of agents) {
			const closed = decidingRule(rules, '/')?.allow === false;
			if (!TRAINING_AGENTS.includes(agent)) {
				for (const page of hidden) {
					const deciding = decidingRule(rules, `${policy.base}${page}`);
					if (deciding && !deciding.allow) problems.push(`robots.txt: Disallow ${deciding.rule} для ${agent} покриває сторінку з noindex (${page}) — тег не буде прочитано`);
				}
				if (closed && !recorded.has(agent)) {
					const who = agent === '*' ? 'група * (усі не названі окремо)' : `бот ${agent}`;
					problems.push(`robots.txt: ${who} закритий (/), але не записаний у рішення — blockedSearchAgents`);
				}
			}
			if (agent === '*') continue;
			for (const rule of star?.disallow ?? []) {
				const sample = rule.replace(/\$$/, '').replaceAll('*', '');
				if (decidingRule(rules, sample)?.allow !== false) problems.push(`robots.txt: група ${agent} не має Disallow ${rule} з групи *`);
			}
		}
	}

	const llmsPath = join(build, 'llms.txt');
	if (!existsSync(llmsPath)) {
		if (policy.expectsLlmsTxt) problems.push('llms.txt: файл відсутній у build/');
		return problems;
	}
	const llms = readFileSync(llmsPath, 'utf8');
	if (!llms.startsWith('# ')) problems.push('llms.txt: немає H1');
	const urls = [...llms.matchAll(/\]\((https?:\/\/[^)\s]+)\)/g)].map((m) => m[1]);
	const root = `${policy.origin}${policy.base}`;
	const seen = new Set();
	for (const url of urls) {
		if (seen.has(url)) problems.push(`llms.txt: ${url} вказано двічі`);
		seen.add(url);
		if (url.startsWith(`${root}/`) && !pageFileFor(build, url.slice(root.length).replace(/[?#].*$/, ''))) {
			problems.push(`llms.txt: ${url} — такого файлу в build/ немає`);
		}
	}
	return problems;
}
