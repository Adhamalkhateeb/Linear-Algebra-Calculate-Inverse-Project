const resultsDiv = document.getElementById("results");

function buildMatrix() {
  const equationCount = parseInt(document.getElementById("eqCount").value);
  const container = document.getElementById("matrixContainer");
  container.innerHTML = "";

  if (!equationCount) return alert("Enter value!");

  let html = "<table><tbody>";
  for (let r = 0; r < equationCount; r++) {
    html += "<tr>";
    for (let c = 0; c < equationCount; c++) {
      html += `<td><input id="cell-${r}-${c}" type="number" placeholder="a${
        r + 1
      }${c + 1}"></td>`;
    }
    html += "</tr>";
  }
  html += "</tbody></table>";
  container.innerHTML = html;
  document.getElementById("solveBtn").style.display = "block";
}

function toFraction(decimal) {
  if (Number.isInteger(decimal)) return `${decimal}`;

  const tolerance = 1e-6;
  let numerator = 1;
  let denominator = 1;
  let minDiff = Math.abs(decimal - numerator / denominator);

  for (let d = 1; d <= 10000; d++) {
    let n = Math.round(decimal * d);
    let diff = Math.abs(decimal - n / d);
    if (diff < minDiff - tolerance) {
      numerator = n;
      denominator = d;
      minDiff = diff;
    }
    if (diff < tolerance) break;
  }

  const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));
  const g = gcd(Math.abs(numerator), Math.abs(denominator));
  numerator /= g;
  denominator /= g;

  return denominator === 1
    ? `${numerator}`
    : `<p><sup>${numerator}</sup> / <sub>${denominator}</sub></p>`;
}

function printStep(msg) {
  if (resultsDiv) {
    resultsDiv.innerHTML += `<p>${msg}</p>`;
  }
}

function printMatrix(matrix, title = "") {
  if (!resultsDiv) return;
  let html = title ? `<h3>${title}</h3>` : "";
  html += '<table class="matrix-table">';
  for (let r = 0; r < matrix.length; r++) {
    html += "<tr>";
    for (let c = 0; c < matrix[r].length; c++) {
      const value = matrix[r][c];
      html += `<td>${
        Math.abs(value - Math.round(value)) > 1e-10 ? toFraction(value) : value
      }</td>`;
    }
    html += "</tr>";
  }
  html += "</table><hr/>";
  resultsDiv.innerHTML += html;
}

function buildDeterminantMatrix(matrix, i, j) {
  let newMatrix = Array.from({ length: matrix.length - 1 }, () =>
    Array(matrix.length - 1).fill(0)
  );
  let rowCounter = 0;
  for (let r = 0; r < matrix.length; r++) {
    if (r === i) continue;
    let colCounter = 0;
    for (let c = 0; c < matrix.length; c++) {
      if (c === j) continue;
      newMatrix[rowCounter][colCounter] = matrix[r][c];
      colCounter++;
    }
    rowCounter++;
  }
  return newMatrix;
}

function printMinor(matrix) {
  let n = matrix.length;
  let message = "<br><span style='white-space: pre;'>";

  for (let i = 0; i < n; i++) {
    message += "|";

    for (let j = 0; j < n; j++) {
      message += String(matrix[i][j]).padStart(4, " ");
    }

    message += "|".padStart(4, " ");

    if (i < n - 1) message += "\n";
  }

  message += "</span>";

  return message;
}

function GetDeterminant(matrix, n) {
  printStep(`<b>Find determinant Matrix:${printMinor(matrix)}</b>`);

  if (n === 1) {
    printStep(`Determinant = ${matrix[0][0]}`);
    return matrix[0][0];
  }

  if (n === 2) {
    const a = matrix[0][0];
    const b = matrix[0][1];
    const c = matrix[1][0];
    const d = matrix[1][1];

    const result = a * d - b * c;
    printStep(`(${a} × ${d}) - (${b} × ${c}) = ${result}`);
    printStep(`<b>Determinant = ${result}</b><br>`);
    return result;
  }

  printStep(`Using cofactor expansion along first row:`);
  let result = 0;

  for (let c = 0; c < n; c++) {
    const sign = Math.pow(-1, c);
    const element = matrix[0][c];

    if (Math.abs(element) > 1e-10) {
      let minor = buildDeterminantMatrix(matrix, 0, c);
      printStep(
        `Element a<sub>1${c + 1}</sub> = ${element}, sign = ${
          sign > 0 ? "+" : "-"
        }`
      );
      printStep(`Minor M<sub>1${c + 1}</sub>:${printMinor(minor)}`);

      const minorDet = GetDeterminant(minor, n - 1);

      const term = sign * element * minorDet;
      printStep(
        `Term ${c + 1} = (-1)^ <sup>${
          1 + c + 1
        }</sup> × ${element} × ${minorDet} = ${term}`
      );
      result += term;
    }
  }

  printStep(`<b>Sum of all terms = ${result}</b><br>`);
  return result;
}

function GetCofactor(matrix) {
  const size = matrix.length;
  printStep(`<strong>Step 2: Find cofactor matrix</strong>`);
  printStep(`Cᵢⱼ = (-1)ⁱ⁺ʲ × det(Mᵢⱼ)`);

  const cofactorMatrix = Array.from({ length: size }, () =>
    Array(size).fill(0)
  );

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      const minor = buildDeterminantMatrix(matrix, r, c);
      const minorDet = GetDeterminant(minor, size - 1);
      const sign = Math.pow(-1, r + c);
      cofactorMatrix[r][c] = sign * minorDet;

      printStep(
        `C<sub>${r + 1}${c + 1}</sub> = ${sign > 0 ? "+" : "-"} det(M<sub>${
          r + 1
        }${c + 1}</sub>) = (-1)^ <sup>${r + 1 + c + 1}</sup> × ${minorDet} = ${
          cofactorMatrix[r][c]
        }`
      );
    }
  }

  printMatrix(cofactorMatrix, "Cofactor Matrix");
  return cofactorMatrix;
}

function GetTranspose(matrix) {
  const n = matrix.length;
  printStep(`<strong>Step 3: Transpose the matrix</strong>`);

  const transposedMatrix = Array.from({ length: n }, () => Array(n).fill(0));
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      transposedMatrix[i][j] = matrix[j][i];
    }
  }

  printMatrix(transposedMatrix, "Transposed Matrix");
  return transposedMatrix;
}

function GetAdjoint(matrix) {
  const cofactor = GetCofactor(matrix);
  const adjoint = GetTranspose(cofactor);

  printMatrix(adjoint, "<strong>Step 4: Adjoint Matrix</strong>");
  return adjoint;
}

function GetInverse(matrix) {
  const n = matrix.length;

  printStep(`<strong>Step 1: Calculate determinant</strong>`);
  const determinant = GetDeterminant(matrix, n, 1);

  if (Math.abs(determinant) < 1e-10)
    throw new Error("Matrix is singular (det = 0), cannot find inverse.");

  printStep(`<b>Determinant = ${determinant}</b><br>`);

  const adjointMatrix = GetAdjoint(matrix);

  printStep(`<strong>Step 5: Calculate inverse matrix</strong>`);
  printStep(
    `Inverse = (1/det) × adjoint = (1/${determinant}) × adjoint matrix`
  );
  const resultMatrix = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      const val = adjointMatrix[r][c] / determinant;
      resultMatrix[r][c] = Math.abs(val) < 1e-12 ? 0 : val;
    }
  }

  return resultMatrix;
}

function Solve() {
  const n = parseInt(document.getElementById("eqCount").value);
  if (!resultsDiv) return;

  const matrix = Array.from({ length: n }, () => Array(n).fill(0));
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      matrix[r][c] = parseFloat(
        document.getElementById(`cell-${r}-${c}`).value || 0
      );
    }
  }

  resultsDiv.style.display = "block";
  resultsDiv.innerHTML = "<h2>Matrix Inverse Calculation Steps:</h2>";

  try {
    printMatrix(matrix, "Original Matrix");

    const inverse = GetInverse(matrix);
    printMatrix(inverse, "Inverse Matrix");
  } catch (error) {
    printStep(`<b style="color: red;">Error: ${error.message}</b>`);
  }
}
