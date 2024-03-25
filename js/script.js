'use strict';

buildClassification();

/**
 * 
 * Author: Yevhenii Holubovych
 * 
 */


function buildClassification() {
	let criteria = {
		'K1': ['1', '2'],
		'K2': ['1', '2'],
		'K3': ['1', '2', '3'],
		'K4': ['1', '2', '3', '4'],
		'K5': ['1']
	};
	let PMDanswers = '1	1	1	1	1	1	1	1	2	1	1	1	1	2	1'.split('	');
	let alternativesCount = countAlternativesNumber(criteria);
	
	let count = 1;
	let g = [];
	let isDone = false;
	while (!isDone) {
		if (PMDanswers.length + 1 >= count) {
			let result = addIteration(count, PMDanswers[count - 1], g, criteria, alternativesCount);
			isDone = result['isDone'];
			g = result['g'];
			count += 1;
		}
		else {
			isDone = true;
		}
	}
}

function countAlternativesNumber(criteria) {
	let alternativesCount = 1;
	for (let criterion of Object.keys(criteria)) if (criteria[criterion].length != 0) alternativesCount *= criteria[criterion].length;
	return alternativesCount;
}

function createCriteriaColumns(index, criteria, alternativesCount) {
	let table = document.getElementById('table' + index);
	let headerRow = document.createElement('tr');
	let headerNumber = document.createElement('th');
	headerNumber.textContent = '№';
	headerRow.append(headerNumber);
	for (let criterion of Object.keys(criteria)) {
		let headerData = document.createElement('th');
		headerData.textContent = criterion;
		headerRow.append(headerData);
	}
	table.append(headerRow);

	let count = 0;
	while (count < alternativesCount) {
		let row = document.createElement('tr');
		let countCopy = count;
		let alternativesCountCopy = alternativesCount;
		let numberData = document.createElement('td');
		numberData.textContent = count + 1;
		row.append(numberData);
		for (let i = 0; i < Object.keys(criteria).length; i++) {
			let criterionData = document.createElement('td');
			let criterionName = Object.keys(criteria)[i];
			alternativesCountCopy = Math.floor(alternativesCountCopy / criteria[criterionName].length);
			let criterionValueIndex = Math.floor(countCopy / alternativesCountCopy);
			countCopy %= alternativesCountCopy;
			criterionData.textContent = criteria[criterionName][criterionValueIndex];
			row.append(criterionData);
		}
		table.append(row);
		count += 1;
	}
}

function createGColumn(index, g = [], alternativesCount) {
	let table = document.getElementById('table' + index);
	let headerData = document.createElement('th');
	headerData.textContent = 'G';
	table.rows[0].append(headerData);

	let count = 1;
	while(count <= alternativesCount) {
		let dataG = document.createElement('td');
		if (count == 1) dataG.textContent = '1';
		else if (count == alternativesCount) dataG.textContent = '2';
		else if (g.length == 0) dataG.textContent = '1,2';
		else dataG.textContent = g[count - 1];
		table.rows[count].append(dataG);
		count += 1;
	}
	
}

function createD12Columns(index, G_COLUMN, criteria, alternativesCount) {
	let table = document.getElementById('table' + index);
	let headerData1 = document.createElement('th');
	headerData1.textContent = 'd1';
	table.rows[0].append(headerData1);

	let headerData2 = document.createElement('th');
	headerData2.textContent = 'd2';
	table.rows[0].append(headerData2);

	let count = 1;
	let y1 = {'count': 0};
	let y2 = {'count': 0};
	const START_INDEX = 1; // Start iterating from 1 due to the column with row number
	while(count <= alternativesCount) {
		if (table.rows[count].cells[G_COLUMN].textContent == '1') {
			let innerCount = START_INDEX;
			for (let criterion of Object.keys(criteria)) {
				if (y1[criterion] != null) y1[criterion] += parseInt(table.rows[count].cells[innerCount].textContent);
				else y1[criterion] = parseInt(table.rows[count].cells[innerCount].textContent);
				innerCount += 1;
			}
			y1['count'] += 1;
		} else if (table.rows[count].cells[G_COLUMN].textContent == '2') {
			let innerCount = START_INDEX;
			for (let criterion of Object.keys(criteria)) {
				if (y2[criterion] != null) y2[criterion] += parseInt(table.rows[count].cells[innerCount].textContent);
				else y2[criterion] = parseInt(table.rows[count].cells[innerCount].textContent);
				innerCount += 1;
			}
			y2['count'] += 1;
		}
		count += 1;
	}
	for (let criterion of Object.keys(criteria)) {
		y1[criterion] /= y1['count'];
		y2[criterion] /= y2['count'];
	}
	
	count = 1;
	while(count <= alternativesCount) {
		let sumD1 = 0;
		for (let i = START_INDEX; i < G_COLUMN; i++) {
			sumD1 += Math.abs(table.rows[count].cells[i].textContent - y1[table.rows[0].cells[i].textContent]);
		}
		sumD1 = Math.round(sumD1 * 1000) / 1000;
		let currentD1 = document.createElement('td');
		currentD1.textContent = sumD1;
		table.rows[count].append(currentD1);

		let sumD2 = 0;
		for (let i = START_INDEX; i < G_COLUMN; i++) {
			sumD2 += Math.abs(table.rows[count].cells[i].textContent - y2[table.rows[0].cells[i].textContent]);
		}
		sumD2 = Math.round(sumD2 * 1000) / 1000;
		let currentD2 = document.createElement('td');
		currentD2.textContent = sumD2;
		table.rows[count].append(currentD2);

		count += 1;
	}
}

function createP12Columns(index, G_COLUMN, alternativesCount) {
	let table = document.getElementById('table' + index);
	let headerData1 = document.createElement('th');
	headerData1.textContent = 'p1';
	table.rows[0].append(headerData1);

	let headerData2 = document.createElement('th');
	headerData2.textContent = 'p2';
	table.rows[0].append(headerData2);

	let count = 1;
	let maxD = parseInt(table.rows[count].cells[G_COLUMN + 1].textContent);
	let rowMaxD = 1;
	while(count <= alternativesCount) {
		if (maxD < table.rows[count].cells[G_COLUMN + 1].textContent) {
			maxD = table.rows[count].cells[G_COLUMN + 1].textContent;
			rowMaxD = count;
		} 
		if (maxD < table.rows[count].cells[G_COLUMN + 2].textContent) {
			maxD = table.rows[count].cells[G_COLUMN + 2].textContent;
			rowMaxD = count;
		}
		count += 1;
	}
	let additionalInfo = document.getElementById('additionalH' + index);
	additionalInfo.innerHTML += `Рядок №${rowMaxD} має найбільше значення D = ${maxD}<br>`;

	count = 1;
	while(count <= alternativesCount) {
		let p1;
		let p2;
		if (table.rows[count].cells[G_COLUMN].textContent == '1') {
			p1 = 1;
			p2 = 0;
		}
		else if (table.rows[count].cells[G_COLUMN].textContent == '2') {
			p1 = 0;
			p2 = 1;
		}
		else {
			let top = maxD - table.rows[count].cells[G_COLUMN + 1].textContent;
			let bottom = 2 * maxD - table.rows[count].cells[G_COLUMN + 1].textContent - table.rows[count].cells[G_COLUMN + 2].textContent;
			p1 = top / bottom;
			p1 = Math.round(p1 * 1000) / 1000;
			p2 = Math.round((1 - p1) * 1000) / 1000;
		}
		let currentP1 = document.createElement('td');
		currentP1.textContent = p1;
		table.rows[count].append(currentP1);
		let currentP2 = document.createElement('td');
		currentP2.textContent = p2;
		table.rows[count].append(currentP2);
		count += 1;
	}
}

function createG12Columns(index, G_COLUMN, alternativesCount) {
	let table = document.getElementById('table' + index);
	let headerData1 = document.createElement('th');
	headerData1.textContent = 'g1';
	table.rows[0].append(headerData1);

	let headerData2 = document.createElement('th');
	headerData2.textContent = 'g2';
	table.rows[0].append(headerData2);

	let count = 1;
	while(count <= alternativesCount) {
		let innerCount = 1;
		let g1 = 0;
		let g2 = 0;
		let gValue = table.rows[count].cells[G_COLUMN].textContent;
		if (gValue == '1,2') {
			const START_INDEX = 1; // Start iterating from 1 due to the column with row number
			while(innerCount <= alternativesCount) {
				if (innerCount != count && table.rows[innerCount].cells[G_COLUMN].textContent == '1,2') {
					let better = 0;
					let worse = 0;
					for (let i = START_INDEX; i < G_COLUMN; i++) {
						if (table.rows[count].cells[i].textContent > table.rows[innerCount].cells[i].textContent) {
							worse += 1;
						}
						else if (table.rows[count].cells[i].textContent < table.rows[innerCount].cells[i].textContent) {
							better += 1;
						}
					}
					if (worse == 0) {
						g2 += 1;
					}
					else if (better == 0) {
						g1 += 1;
					}
				}
				innerCount += 1;
			}
		}
		let currentG1 = document.createElement('td');
		currentG1.textContent = g1;
		table.rows[count].append(currentG1);
		let currentG2 = document.createElement('td');
		currentG2.textContent = g2;
		table.rows[count].append(currentG2);
		count += 1;
	}
}

function createF12Columns(index, G_COLUMN, alternativesCount) {
	let table = document.getElementById('table' + index);
	let headerData1 = document.createElement('th');
	headerData1.textContent = 'F1';
	table.rows[0].append(headerData1);

	let headerData2 = document.createElement('th');
	headerData2.textContent = 'F2';
	table.rows[0].append(headerData2);

	let count = 1;
	while(count <= alternativesCount) {
		let f1;
		let f2;
		if (table.rows[count].cells[G_COLUMN].textContent == '1,2') {
			let p1 = table.rows[count].cells[G_COLUMN + 3].textContent;
			let p2 = table.rows[count].cells[G_COLUMN + 4].textContent;
			let g1 = table.rows[count].cells[G_COLUMN + 5].textContent;
			let g2 = table.rows[count].cells[G_COLUMN + 6].textContent;
			f1 = p1 * g1;
			f1 = Math.round(f1 * 1000) / 1000;
			f2 = p2 * g2;
			f2 = Math.round(f2 * 1000) / 1000;
		}
		else {
			f1 = 0;
			f2 = 0;
		}
		let currentF1 = document.createElement('td');
		currentF1.textContent = f1;
		table.rows[count].append(currentF1);
		let currentF2 = document.createElement('td');
		currentF2.textContent = f2;
		table.rows[count].append(currentF2);

		count += 1;
	}
}

function createTotalFColumn(index, G_COLUMN, alternativesCount) {
	let table = document.getElementById('table' + index);
	let headerData = document.createElement('th');
	headerData.textContent = 'F';
	table.rows[0].append(headerData);

	let fMax = 0;
	let fMaxRow = 1;
	let count = 1;
	while(count <= alternativesCount) {
		let f;
		if (table.rows[count].cells[G_COLUMN].textContent == '1,2') {
			let f1 = table.rows[count].cells[G_COLUMN + 7].textContent;
			let f2 = table.rows[count].cells[G_COLUMN + 8].textContent;
			f = parseFloat(f1) + parseFloat(f2);
			f = Math.round(f * 1000) / 1000;
			if (f > fMax) {
				fMax = f;
				fMaxRow = count;
			}
		}
		else {
			f = 0;
		}
		let currentF = document.createElement('td');
		currentF.textContent = f;
		table.rows[count].append(currentF);

		count += 1;
	}

	if (fMax == 0) {
		count = 1;
		while(count <= alternativesCount) {
			if (table.rows[count].cells[G_COLUMN].textContent == '1,2') {
				return count;
			}
			count += 1;
		}
	}
	return fMaxRow;
}

function refillGValues(index, G_COLUMN, fMaxRow, PMDanswer, alternativesCount) {
	let table = document.getElementById('table' + index);

	let additionalInfo = document.getElementById('additionalH' + index);
	additionalInfo.innerHTML += `Рядок №${fMaxRow} має найбільше значення F = ${table.rows[fMaxRow].cells[G_COLUMN + 9].textContent}<br>`;

	let g = new Array(alternativesCount);
	PMDanswer = String(PMDanswer);
	let count = 1;
	while(count <= alternativesCount) {
		if (table.rows[count].cells[G_COLUMN].textContent != '1,2') {
			g[count - 1] = table.rows[count].cells[G_COLUMN].textContent;
		}
		else if (count == fMaxRow) {
			g[count - 1] = PMDanswer;
		}
		else {
			if (table.rows[count].cells[G_COLUMN + 3].textContent == '1') {
				g[count - 1] = '1';
			}
			else if (table.rows[count].cells[G_COLUMN + 4].textContent == '1') {
				g[count - 1] = '2';
			}
			else {
				const START_INDEX = 1; // Start iterating from 1 due to the column with row number
				if (PMDanswer == '1') {
					let isBetter = true;
					for (let i = START_INDEX; i < G_COLUMN; i++) {
						if (table.rows[count].cells[i].textContent > table.rows[fMaxRow].cells[i].textContent) {
							isBetter = false;
							break;
						}
					}
					if (isBetter) {
						g[count - 1] = PMDanswer;
					}
					else {
						g[count - 1] = table.rows[count].cells[G_COLUMN].textContent;
					}
				}
				else if (PMDanswer == '2') {
					let isWorse = true;
					for (let i = START_INDEX; i < G_COLUMN; i++) {
						if (table.rows[count].cells[i].textContent < table.rows[fMaxRow].cells[i].textContent) {
							isWorse = false;
							break;
						}
					}
					if (isWorse) {
						g[count - 1] = PMDanswer;
					}
					else {
						g[count - 1] = table.rows[count].cells[G_COLUMN].textContent;
					}
				}
			}
		}
		count += 1;
	}
	return g;
}

function isTableFilled(index, G_COLUMN, alternativesCount) {
	let table = document.getElementById('table' + index);
	let count = 1;
	while(count <= alternativesCount) {
		if (table.rows[count].cells[G_COLUMN].textContent == '1,2') {
			return false;
		}
		count += 1;
	}
	return true;
}

function addIteration(index, PMDanswer, g, criteria, alternativesCount) {
	let iteration = document.createElement('h3');
	iteration.textContent = `Ітерація №${index}`;
	document.body.lastChild.before(iteration);
	let table = document.createElement('table');
	table.id = 'table' + index;
	document.body.lastChild.before(table);
	let additionalInfo = document.createElement('h4');
	additionalInfo.id = 'additionalH' + index;
	document.body.lastChild.before(additionalInfo);
	const G_COLUMN = Object.keys(criteria).length + 1;
	createCriteriaColumns(index, criteria, alternativesCount);
	createGColumn(index, g, alternativesCount);
	createD12Columns(index, G_COLUMN, criteria, alternativesCount);
	createP12Columns(index, G_COLUMN, alternativesCount);
	createG12Columns(index, G_COLUMN, alternativesCount);
	createF12Columns(index, G_COLUMN, alternativesCount);
	let fMaxRow = createTotalFColumn(index, G_COLUMN, alternativesCount);
	g = refillGValues(index, G_COLUMN, fMaxRow, PMDanswer, alternativesCount);
	let isDone = isTableFilled(index, G_COLUMN, alternativesCount);
	if (isDone) {
		iteration.textContent = `Завершено у ${index - 1} ітераці(й/ї):`;
		document.getElementById('additionalH' + index).remove();
	}
	return {
		isDone: isDone,
		g: g
	};
}