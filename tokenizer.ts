import fs from 'fs'
import path from 'path'

const str = fs.readFileSync(path.resolve(__dirname, 'DATA.txt'), 'utf-8')
// UTF-8 
const bufferInput = Buffer.from(str, 'utf-8');
console.log(bufferInput)


/** what getPairState does?
first of all it iterates over buffer input that is all ASCII representation of string characters
save chars as num1 and num2 
now as we are iterating over buffered inputs (ascii) we will store current iteration of chars as num1 adn num2 and compute its occurings and store it in stats
and in order to display maximum occurings first with its values push values in final values
so we will be having number of occurings of chars in order (current char & current char++) and increment it

occuring count [char1, char2]
**/
function getPairStats(data: number[]) {  // for example we got 45, 89 as a pair for chars we will assign it a common id according to its occuring
	const stats: Record<string, number | undefined> = {}

	// [65,  32,  80, 114, 111, 103, 114,  97, 109, 109, 101, ...]
	for (let i = 0; i < data.length - 1; i++) {
		const num1 = data[i]
		const num2 = data[i + 1]

		stats[`${num1}-${num2}`] = (stats[`${num1}-${num2}`] ?? 0) + 1
	}

	// console.log(stats)

	const finalValue: [number, [number, number]][] = []

	for (const key in stats) {
		finalValue.push([
			stats[key] ?? 0,
			key.split('-').map((t) => parseInt(t, 10)) as [number, number],
		])
	}

	return finalValue.sort((a, b) => b[0] - a[0])
}

console.log(getPairStats([...bufferInput]))

// will accept raw bytes (char representation of utf-8, to pair 2 char representation and assign its number of occurings, new token id (final one))
function performTokenSwapping({
	tokens, // bytes (single char representation of utf-8)
	mergePair, // paring/clubing 2 char representation and assigning its occurings
	newTokenId, // new and final token id to replace mergePair
}: {
	tokens: number[]
	mergePair: [number, number]
	newTokenId: number
}): number[] {
	let tokensToOperate = [...tokens]

	for (let i = 0; i < tokensToOperate.length - 1; i++) {
		const num1 = tokensToOperate[i]
		const num2 = tokensToOperate[i + 1]

		if (num1 === mergePair[0] && num2 === mergePair[1]) {
			// found the pair
			tokensToOperate[i] = newTokenId
			tokensToOperate[i + 1] = null as never // we'll remove it later
		}
	}

	tokensToOperate = tokensToOperate.filter((t) => t != null)
	// console.dir(tokensToOperate.join(' '), { maxStringLength: null })

	return tokensToOperate
}

function tokenize() {
	const str = fs.readFileSync(path.resolve(__dirname, 'DATA.txt'), 'utf-8');
	const bytes = [...Buffer.from(str, 'utf-8')];

	const sizeOfVocab = 300
	const iterationsRequired = sizeOfVocab - 256 // remianing numbers length (300 - 256) iteration will happen between them

	let tokensToOperateOn = [...bytes] // it consists of ascii/utf-8 representation of DATA.txt

	const mergeDictOrdered: [`${number}-${number}`, number][] = [] 

	for (let i = 0; i < iterationsRequired; i++) {
		const sortedPairStats = getPairStats(tokensToOperateOn) // calling getPairState to assgin chars as num1, num2 (of char1, char2) and its occuring so sortedPairStats 
        // stores [number of occuring] = [num1, num2] num1 num2 are char represenattion in ascii/utf-8

		const newTokenId = i + 256 // main assigne to this sortedpair using token swapping function

		tokensToOperateOn = performTokenSwapping({
			tokens: tokensToOperateOn, // raw bytes (ASCII/UTF-8 representation of chars in DATA.txt)
			mergePair: sortedPairStats[0][1], // calling this to have pairs for chars and its occurings so clubing two char represenatations and assigning them number of occurings
			newTokenId, // id to swap entire merge pair with
		})

		mergeDictOrdered.push([
			`${sortedPairStats[0][1][0]}-${sortedPairStats[0][1][1]}`,
			newTokenId,
		])
	}

	console.log('Original', bytes.length) // chars representative length
	console.log('Final', tokensToOperateOn.length) // bytes length (numbers representation of characters)
	console.log('Final', mergeDictOrdered) // final token

	function encode(str: string) {
		let bytes = [...Buffer.from(str, 'utf-8')]
		// console.log({ str, bytes })

		for (const item of mergeDictOrdered) {
			const priorityKey = item[0]

			for (let i = 0; i < bytes.length - 1; i++) {
				const b1 = bytes[i]
				const b2 = bytes[i + 1]

				if (priorityKey === `${b1}-${b2}`) {
					// good to replace
					bytes[i] = item[1]
					bytes[i + 1] = null as never // will be removed later

					// skip the next byte (its going to be null)
					i++
				}
			}
		}

		bytes = bytes.filter((t) => t != null)

		return bytes
	}

	function decode(tokens: number[]) {
		const bytes = [...tokens]

		const reverseDictionary: Record<
			number,
			{ n1: number; n2: number } | undefined
		> = {}

		for (const item of mergeDictOrdered) {
			const [n1, n2] = item[0].split('-').map((t) => parseInt(t, 10)) as [
				number,
				number
			]
			reverseDictionary[item[1]] = { n1, n2 }
		}

		for (let i = 0; i < bytes.length; i++) {
			const lookup = reverseDictionary[bytes[i]]
			if (lookup != null) {
				bytes[i] = lookup.n1
				bytes.splice(i + 1, 0, lookup.n2)
				i-- // process this byte again because there could be layers and layers of encoding
			}
		}

		return Buffer.from(bytes).toString('utf-8')
	}

	console.log('Encoding', encode('hello world!'))
	console.log('Decoding', decode(encode('hello world!')))
}

tokenize()