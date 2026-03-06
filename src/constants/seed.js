export const SEED_DATA = {
  leads: [
    { id: "l1", name: "Sarah Torres", source: "The Knot", score: 94, status: "hot", detail: "Sept 2026, 180 guests, $45K+.", revenue: 48000, email: "storres@email.com" },
    { id: "l2", name: "Raytheon Tech", source: "LinkedIn", score: 88, status: "hot", detail: "400+ employees. Q2 team build.", revenue: 15000, email: "" },
    { id: "l3", name: "Jessica Kim", source: "WeddingWire", score: 91, status: "hot", detail: "150 guests, fall. $50K+.", revenue: 52000, email: "jkim@email.com" },
    { id: "l4", name: "MetroWest Chamber", source: "Event Board", score: 82, status: "warm", detail: "Annual gala, 250 pax.", revenue: 32000, email: "" },
    { id: "l5", name: "TJX Companies", source: "LinkedIn", score: 86, status: "hot", detail: "Exec retreat, 60 leaders.", revenue: 25000, email: "" },
    { id: "l6", name: "Donnelly Family", source: "Referral", score: 92, status: "hot", detail: "Peterson referral.", revenue: 18000, email: "donnelly@email.com" },
  ],
  pipeline: [
    { id: "p1", name: "Torres Wedding", value: 48000, stage: "tour", prob: 70, date: "Sep 2026" },
    { id: "p2", name: "Kim Wedding", value: 52000, stage: "proposal", prob: 65, date: "Oct 2026" },
    { id: "p3", name: "Raytheon Build", value: 15000, stage: "meeting", prob: 50, date: "Jun 2026" },
    { id: "p4", name: "Chamber Gala", value: 32000, stage: "proposal", prob: 60, date: "Nov 2026" },
    { id: "p5", name: "TJX Retreat", value: 25000, stage: "meeting", prob: 55, date: "May 2026" },
  ],
  activity: [],
};
