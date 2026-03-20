export interface SensorReading {
  pH: number;
  tds: number;
  flowRate: number;
  timestamp: Date;
  hcsSequence: number;
  pHBreach: boolean;
  tdsBreach: boolean;
  flowBreach: boolean;
  anyBreach: boolean;
  hmacHash: string;
}

let hcsSeq = 1441892;
let wrtCount = 14;

function randomHex(len: number): string {
  const chars = '0123456789abcdef';
  let s = '';
  for (let i = 0; i < len; i++) s += chars[Math.floor(Math.random() * 16)];
  return s;
}

export function generateReading(): SensorReading {
  hcsSeq++;
  const pH = parseFloat((6.2 + Math.random() * 2.7).toFixed(2));
  const tds = Math.floor(1800 + Math.random() * 600);
  const flowRate = parseFloat((42 + Math.random() * 16).toFixed(1));
  const pHBreach = pH < 6.5 || pH > 8.5;
  const tdsBreach = tds > 2100;
  const flowBreach = false;
  return {
    pH, tds, flowRate,
    timestamp: new Date(),
    hcsSequence: hcsSeq,
    pHBreach, tdsBreach, flowBreach,
    anyBreach: pHBreach || tdsBreach || flowBreach,
    hmacHash: randomHex(64),
  };
}

export function getWrtCount(breach: boolean): number {
  if (!breach && Math.random() > 0.7) wrtCount++;
  return wrtCount;
}

export function resetSimulator() {
  hcsSeq = 1441892;
  wrtCount = 14;
}

export function generateMockHcsEntries(count: number) {
  const entries = [];
  for (let i = 0; i < count; i++) {
    const r = generateReading();
    const sensor = ['pH_SENSOR_01', 'TDS_SENSOR_01', 'FLOW_SENSOR_01'][i % 3];
    const value = i % 3 === 0 ? `${r.pH}` : i % 3 === 1 ? `${r.tds} mg/L` : `${r.flowRate} m³/h`;
    const breach = i % 3 === 0 ? r.pHBreach : i % 3 === 1 ? r.tdsBreach : false;
    entries.push({
      seq: r.hcsSequence,
      timestamp: r.timestamp.toISOString().slice(11, 19),
      sensor,
      value,
      hmac: r.hmacHash.slice(0, 16),
      compliant: !breach,
    });
  }
  return entries;
}

export function generateAuditHcsRows(count: number) {
  const rows = [];
  const base = 1441800;
  for (let i = 0; i < count; i++) {
    const ts = new Date(Date.now() - (count - i) * 10000);
    rows.push({
      seq: base + i,
      timestamp: ts.toISOString().slice(0, 19).replace('T', ' '),
      consensusTs: `0.0.${3900000 + i}.${randomHex(8)}`,
      sensorDid: `did:hedera:testnet:z6Mk${['pH_SENSOR_01','TDS_SENSOR_01','FLOW_SENSOR_01'][i%3]}`,
      dataHash: randomHex(64),
      status: Math.random() > 0.12 ? 'COMPLIANT' : 'BREACH',
    });
  }
  return rows;
}

export function generateAuditCloudTrailRows(count: number) {
  const rows = [];
  for (let i = 0; i < count; i++) {
    const ts = new Date(Date.now() - (count - i) * 10000);
    rows.push({
      eventId: randomHex(32),
      eventTime: ts.toISOString().slice(0, 19).replace('T', ' '),
      eventName: 'KMS:Sign',
      kmsArn: `arn:aws:kms:ap-south-1:123456789012:key/mrk-${randomHex(8)}`,
      callerIdentity: `arn:aws:iam::123456789012:role/triton-edge-${['ph','tds','flow'][i%3]}`,
      outcome: 'Success',
    });
  }
  return rows;
}
