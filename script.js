const roomTypes = {
  "Living": 40,
  "Kitchen": 30,
  "Bedroom": 23,
  "Bathroom": 50,
  "Hall": 18,
  "Office": 30,
  "Utility": 35
};

// Stelrad Classic Compact outputs per METRE at ΔT50
const radiatorData = {
  "K1": {
    450: { wpm: 716, n: 1.28 },
    600: { wpm: 923, n: 1.29 },
    700: { wpm: 1052, n: 1.31 }
  },
  "K2": {
    450: { wpm: 1371, n: 1.33 },
    600: { wpm: 1732, n: 1.33 },
    700: { wpm: 1961, n: 1.34 }
  }
};

function addRoom() {
  const row = document.createElement("tr");

  row.innerHTML = `
    <td><input value="Room"></td>
    <td>${roomTypeSelect()}</td>
    <td><input type="number" value="4" step="0.1"></td>
    <td><input type="number" value="4" step="0.1"></td>
    <td><input type="number" value="30"></td>
    <td>${radTypeSelect()}</td>
    <td>${heightSelect()}</td>
    <td><input type="number" value="1000" step="100"></td>
    <td class="req"></td>
    <td class="inst"></td>
    <td class="pct"></td>
    <td class="status"></td>
  `;

  document.getElementById("roomRows").appendChild(row);
  recalc();
  row.querySelectorAll("input, select").forEach(e => e.addEventListener("input", recalc));
}

function roomTypeSelect() {
  return `<select>${Object.keys(roomTypes).map(r => `<option>${r}</option>`).join("")}</select>`;
}

function radTypeSelect() {
  return `<select><option>K1</option><option>K2</option></select>`;
}

function heightSelect() {
  return `<select><option>450</option><option>600</option><option>700</option></select>`;
}

function recalc() {
  let totalReq = 0;
  let totalInst = 0;

  document.querySelectorAll("#roomRows tr").forEach(row => {
    const cells = row.querySelectorAll("td");

    const roomType = cells[1].querySelector("select").value;
    const w = parseFloat(cells[2].querySelector("input").value);
    const l = parseFloat(cells[3].querySelector("input").value);
    const dT = parseFloat(cells[4].querySelector("input").value);
    const radType = cells[5].querySelector("select").value;
    const height = parseInt(cells[6].querySelector("select").value);
    const radLen = parseFloat(cells[7].querySelector("input").value) / 1000;

    const area = w * l;
    const demand = area * roomTypes[roomType];

    const rad = radiatorData[radType][height];
    const correction = Math.pow(dT / 50, rad.n);
    const installed = rad.wpm * radLen * correction;

    const pct = installed / demand * 100;

    cells[8].innerText = demand.toFixed(0);
    cells[9].innerText = installed.toFixed(0);
    cells[10].innerText = pct.toFixed(0) + "%";

    const status = cells[11];
    if (pct >= 100) {
      status.innerText = "PASS";
      status.className = "pass";
    } else {
      status.innerText = "FAIL";
      status.className = "fail";
    }

    totalReq += demand;
    totalInst += installed;
  });

  document.getElementById("totalSummary").innerText =
    `Whole House: Required ${totalReq.toFixed(0)} W | Installed ${totalInst.toFixed(0)} W | ${((totalInst/totalReq)*100).toFixed(0)}%`;
}

// Add first row
addRoom();
