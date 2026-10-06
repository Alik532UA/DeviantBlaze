import { checkPrerenderEntries, checkSeo } from './check-build/seo.mjs';
import { checkRobotsAndLlms } from './check-build/robots-llms.mjs';

const BUILD = 'build';
const base = '/DeviantBlaze';
const origin = 'https://alik532ua.github.io';
const policy = {
	origin,
	base,
	hostRoot: base === '',
	prerenderEntries: ['*'],
	fallbackPages: ['404.html'],
	shortPages: [],
	expectsSitemap: true,
	expectsLlmsTxt: true,
	blockedSearchAgents: []
};

const PARTS = [
	['SEO § 6.1', () => [...checkSeo(BUILD, policy), ...checkPrerenderEntries(BUILD, policy)]],
	['SEO § 7.5', () => checkRobotsAndLlms(BUILD, policy)]
];

let totalProblems = 0;
for (const [title, run] of PARTS) {
	const problems = run();
	if (problems.length) {
		console.error(`\n❌ ${title}: ${problems.length} problem(s) found:`);
		for (const prob of problems) {
			console.error(`  - ${prob}`);
		}
		totalProblems += problems.length;
	} else {
		console.log(`✅ ${title}: OK`);
	}
}

if (totalProblems > 0) {
	console.error(`\n💥 Build verification failed with ${totalProblems} problem(s).`);
	process.exit(1);
} else {
	console.log(`\n🎉 All build SEO verification checks passed!`);
}
