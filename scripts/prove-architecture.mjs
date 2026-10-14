import { spawn } from 'node:child_process'
import console from 'node:console'
import { copyFile, mkdir, mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const fixture = await mkdtemp(resolve(root, '.jst-proof-'))
const log = []

try {
	await writeFile(resolve(fixture, 'package.json'), JSON.stringify({ name: 'jst-architecture-proof', private: true, type: 'module' }))
	await Promise.all(['tsconfig.json', 'tsconfig.app.json', 'tsconfig.node.json'].map(name => copyFile(resolve(root, name), resolve(fixture, name))))
	await symlink(resolve(root, 'node_modules'), resolve(fixture, 'node_modules'), process.platform === 'win32' ? 'junction' : 'dir')
	await mkdir(resolve(fixture, 'src'))
	await copyFile(resolve(root, 'src/vite-env.d.ts'), resolve(fixture, 'src/vite-env.d.ts'))
	await generate('checkout')
	await generate('catalog')
	await lint('initial green project', true)

	const component = resolve(fixture, 'src/features/checkout/ui/checkout.component.tsx')
	const original = await readFile(component, 'utf8')
	const violated = original
		.replace(`import { Box } from '@mantine/core'`, `import { Box } from '@mantine/core'\nimport { CatalogView } from '../../catalog/ui/catalog.component'`)
		.replace('return <Box', `void fetch('/api/checkout')\n\treturn <><CatalogView /><Box`)
		.replace('component="section" />', 'component="section" /></>')
	await writeFile(component, violated)

	const diagnostics = await lint('intentional violations', false)
	assertRules(diagnostics, ['jst/effects-at-boundary', 'jst/import-contract'])
	await printDiagnostics(diagnostics)

	await writeFile(component, original)
	await lint('repaired green project', true)
	console.log('Architecture proof passed: green → rejected → repaired → green.')
}
catch (error) {
	await preserveFailure(error)
	throw error
}
finally {
	await rm(fixture, { force: true, recursive: true })
}

async function generate(name) {
	await run(process.execPath, [resolve(root, 'scripts/create-slice.mjs'), 'feature', name, '--no-install', '--yes'], fixture)
}

async function lint(label, expectSuccess) {
	const result = await run(process.execPath, [
		resolve(root, 'node_modules/eslint/bin/eslint.js'),
		'src',
		'--config',
		resolve(root, 'eslint.config.js'),
		'--format',
		'json',
		'--no-cache',
	], fixture, true)
	log.push(`${label}: exit ${result.code}\n${result.stdout}\n${result.stderr}`)
	if (expectSuccess && result.code !== 0) {
		throw new Error(`${label} failed:\n${result.stderr || result.stdout}`)
	}
	if (!expectSuccess && result.code === 0) {
		throw new Error(`${label} unexpectedly passed.`)
	}
	return JSON.parse(result.stdout).flatMap(file => file.messages)
}

function assertRules(diagnostics, expected) {
	const actual = new Set(diagnostics.map(item => item.ruleId))
	const missing = expected.filter(rule => !actual.has(rule))
	if (missing.length) {
		throw new Error(`Expected diagnostics were not reported: ${missing.join(', ')}.`)
	}
}

async function printDiagnostics(diagnostics) {
	const plugin = await import('@jst-stack/eslint-plugin')
	for (const item of diagnostics.filter(item => item.ruleId?.startsWith('jst/'))) {
		const rule = plugin.default.rules[item.ruleId.slice('jst/'.length)]
		console.log(`[${item.ruleId}] ${item.message}`)
		console.log(`Docs: ${rule.meta.docs.url}`)
	}
}

async function preserveFailure(error) {
	const artifacts = resolve(root, 'artifacts/architecture-proof')
	await mkdir(artifacts, { recursive: true })
	await writeFile(resolve(artifacts, 'command.log'), `${log.join('\n\n')}\n\n${String(error)}`)
	const component = resolve(fixture, 'src/features/checkout/ui/checkout.component.tsx')
	const finalSource = await readFile(component, 'utf8').catch(() => '<missing>')
	await writeFile(resolve(artifacts, 'final-diff.txt'), `Final checkout component:\n\n${finalSource}`)
}

function run(command, args, cwd, capture = false) {
	return new Promise((resolvePromise, reject) => {
		const child = spawn(command, args, { cwd, shell: false, stdio: capture ? 'pipe' : 'inherit' })
		let stdout = ''
		let stderr = ''
		child.stdout?.on('data', value => stdout += value)
		child.stderr?.on('data', value => stderr += value)
		child.once('error', reject)
		child.once('close', code => resolvePromise({ code, stderr, stdout }))
	})
}
