export type LatLng = [number, number];

export const NEPAL_CENTER: LatLng = [28.3949, 84.124];
export const NEPAL_OVERVIEW_ZOOM = 7;

export const NEPAL_DISTRICT_COORDS: Record<string, LatLng> = {
  Achham: [29.13, 81.29],
  Arghakhanchi: [27.95, 83.1],
  Baglung: [28.27, 83.59],
  Baitadi: [29.55, 80.47],
  Bajhang: [29.54, 81.21],
  Bajura: [29.51, 81.24],
  Banke: [28.05, 81.62],
  Bara: [27.03, 85.0],
  Bardiya: [28.2, 81.34],
  Bhaktapur: [27.67, 85.43],
  Bhojpur: [27.17, 87.05],
  Chitwan: [27.68, 84.43],
  Dadeldhura: [29.3, 80.58],
  Dailekh: [28.84, 81.71],
  Dang: [28.03, 82.48],
  Darchula: [29.84, 80.55],
  Dhading: [27.86, 84.9],
  Dhankuta: [26.98, 87.34],
  Dhanusha: [26.73, 85.93],
  Dolakha: [27.67, 86.05],
  Dolpa: [28.94, 82.9],
  Doti: [29.26, 80.93],
  Gorkha: [28.0, 84.63],
  Gulmi: [28.07, 83.25],
  Humla: [29.97, 81.82],
  Ilam: [26.91, 87.93],
  Jajarkot: [28.7, 82.2],
  Jhapa: [26.58, 88.08],
  Jumla: [29.28, 82.18],
  Kailali: [28.7, 80.6],
  Kalikot: [29.16, 81.62],
  Kanchanpur: [28.96, 80.18],
  Kapilvastu: [27.55, 83.06],
  Kaski: [28.2096, 83.9856],
  Kathmandu: [27.7172, 85.324],
  Kavrepalanchok: [27.62, 85.55],
  Khotang: [27.21, 86.8],
  Lalitpur: [27.6667, 85.3247],
  Lamjung: [28.23, 84.38],
  Mahottari: [26.65, 85.8],
  Makwanpur: [27.43, 85.03],
  Manang: [28.55, 84.24],
  Morang: [26.6459, 87.2718],
  Mugu: [29.55, 82.2],
  Mustang: [28.78, 83.72],
  Myagdi: [28.35, 83.57],
  "Nawalparasi East": [27.63, 84.13],
  "Nawalparasi West": [27.53, 83.66],
  Nuwakot: [27.92, 85.16],
  Okhaldhunga: [27.31, 86.5],
  Palpa: [27.87, 83.55],
  Panchthar: [27.15, 87.75],
  Parbat: [28.23, 83.69],
  Parsa: [27.0, 84.87],
  Pyuthan: [28.1, 82.87],
  Ramechhap: [27.42, 86.08],
  Rasuwa: [28.11, 85.3],
  Rautahat: [26.77, 85.27],
  Rolpa: [28.28, 82.62],
  "Rukum East": [28.6, 82.63],
  "Rukum West": [28.63, 82.49],
  Rupandehi: [27.52, 83.45],
  Salyan: [28.38, 82.16],
  Sankhuwasabha: [27.38, 87.2],
  Saptari: [26.54, 86.75],
  Sarlahi: [26.86, 85.56],
  Sindhuli: [27.26, 85.97],
  Sindhupalchok: [27.79, 85.72],
  Siraha: [26.65, 86.21],
  Solukhumbu: [27.51, 86.66],
  Sunsari: [26.6, 87.15],
  Surkhet: [28.6, 81.63],
  Syangja: [28.1, 83.87],
  Tanahun: [27.98, 84.27],
  Taplejung: [27.35, 87.67],
  Terhathum: [27.13, 87.55],
  Udayapur: [26.79, 86.71],
};

export function getDistrictCoords(name: string): LatLng | null {
  if (!name) return null;
  return NEPAL_DISTRICT_COORDS[name] ?? null;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
