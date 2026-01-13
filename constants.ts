
import type { Team } from './types';
import { Skill } from './types';

export const SNAPSHOT_URL = 'https://api.daa.ie/dub/aops/flightdata/operational/v1/carrier/EI,BA,IB,VY,I2,AA,T2';
export const UPDATES_URL = 'https://api.daa.ie/dub/aops/flightdata/operational/v1/updates';

export const MOCK_SCHEDULE_CSV = `id,aircraftType,aircraftRegistration,stand,requiredTeamSize,arrivalFlightNumber,arrivalCity,arrivalSTA,arrivalETA,arrivalATA,departureFlightNumber,departureCity,departureSTD,departureETD,departureATD,departureSlot,arrivalRemarks,departureRemarks
1,32Q,EI-FNH,100,3,EI100,EWR,2025-11-09T05:15:00,,2025-11-09T05:12:00,EI101,EWR,2025-11-09T13:15:00,,2025-11-09T13:20:00,,Landed Early,Departed
2,333,EI-EAV,104,5,EI104,JFK,2025-11-09T04:20:00,,2025-11-09T04:22:00,EI592,MAD,2025-11-09T06:15:00,,2025-11-09T06:15:00,,,Departed on time
3,333,EI-DUZ,106,5,EI106,JFK,2025-11-09T08:40:00,,2025-11-09T08:38:00,EI105,JFK,2025-11-09T11:15:00,,2025-11-09T11:15:00,,,Good turnaround
4,333,EI-GEY,593,5,EI593,MAD,2025-11-09T12:45:00,2025-11-09T13:05:00,2025-11-09T13:10:00,EI107,JFK,2025-11-09T16:45:00,2025-11-09T17:15:00,,,Late Inbound,Pushback delay exp
5,32Q,EI-LRG,118,3,EI118,IAD,2025-11-09T08:50:00,,2025-11-09T08:50:00,EI109,JFK,2025-11-09T14:30:00,2025-11-09T14:45:00,,2025-11-09T14:50:00,,CTOT 1450
6,32Q,EI-DEO,114,3,EI114,PHL,2025-11-09T05:05:00,,2025-11-09T05:00:00,EI115,PHL,2025-11-09T13:00:00,,2025-11-09T13:05:00,,,Departed
7,32Q,EI-CVA,116,3,EI116,IAD,2025-11-09T04:55:00,,2025-11-09T04:55:00,,,,,,,,,Towed to Hangar
8,32Q,EI-DEI,525,3,EI525,CDG,2025-11-09T14:00:00,2025-11-09T14:10:00,2025-11-09T14:12:00,EI119,IAD,2025-11-09T16:20:00,,,,,On Chocks,
9,333,EI-GAJ,120,5,EI120,MCO,2025-11-09T09:00:00,,2025-11-09T09:05:00,EI123,ORD,2025-11-09T11:30:00,,2025-11-09T11:35:00,,,Departed
10,333,EI-EIL,122,5,EI122,ORD,2025-11-09T05:10:00,,2025-11-09T05:15:00,,,,,,,,Towed off
11,333,EI-GCF,124,5,EI124,ORD,2025-11-09T09:00:00,,2025-11-09T08:55:00,EI141,MIA,2025-11-09T12:30:00,,2025-11-09T12:30:00,,,Departed
12,32Q,EI-LRE,126,3,EI126,YYZ,2025-11-09T05:15:00,,2025-11-09T05:12:00,,,,,,,,
13,32Q,EI-LRD,130,3,EI130,BDL,2025-11-09T04:55:00,,2025-11-09T04:50:00,EI133,BOS,2025-11-09T11:40:00,,2025-11-09T11:40:00,,,Departed
14,32Q,EI-LRC,132,3,EI132,BOS,2025-11-09T04:15:00,,2025-11-09T04:20:00,EI524,CDG,2025-11-09T09:50:00,,2025-11-09T09:55:00,,,Departed
15,332,EI-DAA,136,5,EI136,BOS,2025-11-09T08:20:00,,2025-11-09T08:15:00,,,,,,,,Towed to Remote
16,333,EI-EIN,583,5,EI583,AGP,2025-11-09T14:45:00,2025-11-09T14:40:00,,EI137,BOS,2025-11-09T16:45:00,,,,,Final Approach,
17,32N,EI-NSB,151,3,EI151,LHR,2025-11-09T09:10:00,,2025-11-09T09:10:00,EI158,LHR,2025-11-09T10:00:00,,2025-11-09T10:05:00,,,Departed
18,32N,EI-NSA,611,3,EI611,AMS,2025-11-09T21:15:00,,,EI152,LHR,2025-11-10T06:40:00,,,,,
19,32N,EI-NSC,153,3,EI153,LHR,2025-11-09T10:15:00,,2025-11-09T10:20:00,EI164,LHR,2025-11-09T12:05:00,,2025-11-09T12:10:00,,,Departed
20,32Q,EI-CVC,155,3,EI155,LHR,2025-11-09T11:15:00,,2025-11-09T11:15:00,EI87,CLE,2025-11-09T16:00:00,,,,,,Pre-load started
21,32N,EI-SIE,179,3,EI179,LHR,2025-11-09T22:05:00,,,EI156,LHR,2025-11-10T08:45:00,,,,,
22,32N,EI-SIA,159,3,EI159,LHR,2025-11-09T13:35:00,2025-11-09T13:40:00,2025-11-09T13:42:00,EI172,LHR,2025-11-09T15:30:00,,,,,Cleaning,
23,32N,EI-SIB,165,3,EI165,LHR,2025-11-09T15:40:00,,,EI174,LHR,2025-11-09T16:30:00,,,,,
24,32N,EI-SIC,333,3,EI333,BER,2025-11-09T11:40:00,,2025-11-09T11:35:00,EI166,LHR,2025-11-09T13:05:00,,2025-11-09T13:05:00,,,Departed
25,32N,EI-SIF,167,3,EI167,LHR,2025-11-09T16:35:00,,,EI610,AMS,2025-11-09T17:15:00,,,,,
26,32N,EI-SID,563,3,EI563,BCN,2025-11-09T13:20:00,2025-11-09T13:30:00,2025-11-09T13:30:00,EI168,LHR,2025-11-09T14:15:00,2025-11-09T14:30:00,,2025-11-09T14:30:00,,Turnaround complete,Slot delay
27,32N,EI-SIG,169,3,EI169,LHR,2025-11-09T17:45:00,,,EI178,LHR,2025-11-09T18:30:00,,,,,
28,32N,EI-SIH,173,3,EI173,LHR,2025-11-09T19:05:00,,,EI184,LHR,2025-11-09T19:45:00,,,,,
29,32N,EI-SII,175,3,EI175,LHR,2025-11-09T20:05:00,,,EI332,BER,2025-11-10T06:20:00,,,,,
30,32N,EI-SIJ,177,3,EI177,LHR,2025-11-09T21:05:00,,,,,,,,,,,
31,320,EI-DVN,349,3,EI349,ZRH,2025-11-09T21:30:00,,,EI202,MAN,2025-11-10T06:30:00,,,,,
32,320,EI-DVM,203,3,EI203,MAN,2025-11-09T09:05:00,,2025-11-09T09:05:00,EI552,LYS,2025-11-09T11:00:00,,2025-11-09T11:00:00,,,Departed
33,320,EI-DVO,595,3,EI595,MAD,2025-11-09T23:35:00,,,EI204,MAN,2025-11-10T08:30:00,,,,,
34,320,EI-DVL,205,3,EI205,MAN,2025-11-09T11:00:00,,2025-11-09T11:02:00,EI208,MAN,2025-11-09T12:25:00,,2025-11-09T12:25:00,,,Departed
35,320,EI-DVK,209,3,EI209,MAN,2025-11-09T14:55:00,,,EI336,BER,2025-11-09T15:35:00,,,,,
36,320,EI-DVP,527,3,EI527,CDG,2025-11-09T17:30:00,,,EI212,MAN,2025-11-09T18:15:00,,,,,
37,320,EI-DVQ,213,3,EI213,MAN,2025-11-09T20:45:00,,,EI650,FRA,2025-11-10T06:55:00,,,,,
38,320,EI-DVR,639,3,EI639,BRU,2025-11-09T21:35:00,,,EI262,BHX,2025-11-10T06:40:00,,,,,
39,320,EI-DEO,263,3,EI263,BHX,2025-11-09T09:20:00,,2025-11-09T09:25:00,EI506,BOD,2025-11-09T11:40:00,,2025-11-09T11:45:00,,,Departed
40,320,EI-DEH,673,3,EI673,BUD,2025-11-09T13:10:00,,2025-11-09T13:10:00,EI268,BHX,2025-11-09T14:05:00,,,2025-11-09T14:20:00,Loading complete,Waiting Slot
41,320,EI-DVS,269,3,EI269,BHX,2025-11-09T16:45:00,,,EI394,HAM,2025-11-09T17:25:00,,,,,
42,AT7,EI-GPP,3193,3,EI3193,LPL,2025-11-09T10:30:00,,2025-11-09T10:30:00,EI3330,EXT,2025-11-09T10:55:00,,2025-11-09T11:00:00,,,Departed
43,AT7,EI-FND,3275,3,EI3275,BHX,2025-11-09T18:10:00,,,EI3198,LPL,2025-11-09T19:00:00,,,,,
44,AT7,EI-FNE,3199,3,EI3199,LPL,2025-11-09T21:40:00,,,EI3260,BHX,2025-11-10T07:20:00,,,,,
45,AT7,EI-GPO,3213,3,EI3213,IOM,2025-11-09T10:00:00,,2025-11-09T09:55:00,EI3324,MAN,2025-11-09T10:45:00,,2025-11-09T10:45:00,,,Departed
46,AT7,EI-HDH,3255,3,EI3255,EDI,2025-11-09T14:50:00,2025-11-09T15:05:00,,EI3216,IOM,2025-11-09T16:00:00,2025-11-09T16:20:00,,,Late Inbound,
47,AT7,EI-FNF,3217,3,EI3217,IOM,2025-11-09T18:05:00,,,EI3258,EDI,2025-11-09T18:35:00,,,,,
48,AT7,EI-FNG,3277,3,EI3277,BHX,2025-11-09T21:10:00,,,EI3220,GLA,2025-11-10T06:40:00,,,,,
49,AT7,EI-FNA,3221,3,EI3221,GLA,2025-11-09T09:35:00,,2025-11-09T09:35:00,EI3264,BHX,2025-11-09T10:00:00,,2025-11-09T10:00:00,,,Departed
50,AT7,EI-FNB,3391,3,EI3391,LBA,2025-11-09T09:55:00,,2025-11-09T09:52:00,EI3222,GLA,2025-11-09T10:20:00,,2025-11-09T10:25:00,,,Departed
51,AT7,EI-FNC,3223,3,EI3223,GLA,2025-11-09T13:15:00,,2025-11-09T13:15:00,EI3304,SOU,2025-11-09T13:55:00,2025-11-09T14:00:00,,,Boarding complete,
52,AT7,EI-HDK,3403,3,EI3403,CFN,2025-11-09T13:55:00,,,EI3226,GLA,2025-11-09T14:50:00,,,,,Landed,
53,AT7,EI-FNI,3227,3,EI3227,GLA,2025-11-09T17:40:00,,,EI3394,LBA,2025-11-09T18:10:00,,,,,
54,AT7,EI-FNJ,3305,3,EI3305,SOU,2025-11-09T17:40:00,,,EI3228,GLA,2025-11-09T18:25:00,,,,,
55,AT7,EI-FNK,3229,3,EI3229,GLA,2025-11-09T21:30:00,,,EI3300,SOU,2025-11-10T07:00:00,,,,,
56,AT7,EI-HDL,3261,3,EI3261,BHX,2025-11-09T10:25:00,,2025-11-09T10:25:00,EI3242,ABZ,2025-11-09T10:50:00,,2025-11-09T10:55:00,,,Departed
57,AT7,EI-HDM,3243,3,EI3243,ABZ,2025-11-09T14:30:00,2025-11-09T14:45:00,,EI3274,BHX,2025-11-09T15:10:00,2025-11-09T15:30:00,,,Late Inbound,
58,AT7,EI-FNL,3285,3,EI3285,BRS,2025-11-09T20:30:00,,,EI3250,EDI,2025-11-10T06:30:00,,,,,
59,AT7,EI-FSL,3251,3,EI3251,EDI,2025-11-09T09:40:00,,2025-11-09T09:40:00,EI3252,EDI,2025-11-09T10:10:00,,2025-11-09T10:10:00,,,Departed
60,AT7,EI-FSK,3253,3,EI3253,EDI,2025-11-09T13:15:00,,2025-11-09T13:20:00,EI3284,BRS,2025-11-09T14:00:00,2025-11-09T14:05:00,,,Bags loading,
61,AT7,EI-FSO,3301,3,EI3301,SOU,2025-11-09T11:10:00,,2025-11-09T11:10:00,EI3254,EDI,2025-11-09T11:45:00,,2025-11-09T11:45:00,,,Departed
62,AT7,EI-FSP,3265,3,EI3265,BHX,2025-11-09T12:55:00,,2025-11-09T12:55:00,EI3256,EDI,2025-11-09T13:25:00,,2025-11-09T13:25:00,,,Departed
63,AT7,EI-FNM,3257,3,EI3257,EDI,2025-11-09T16:40:00,,,EI3286,BRS,2025-11-09T17:20:00,,,,,
64,AT7,EI-FNN,3259,3,EI3259,EDI,2025-11-09T21:35:00,,,EI3350,NCL,2025-11-10T07:10:00,,,,,
65,AT7,EI-FNO,3351,3,EI3351,NCL,2025-11-09T17:15:00,,,EI3276,BHX,2025-11-09T18:10:00,,,,,
66,AT7,EI-FNP,3287,3,EI3287,BRS,2025-11-09T21:00:00,,,EI3280,BRS,2025-11-10T06:35:00,,,,,
67,AT7,EI-FCZ,3281,3,EI3281,BRS,2025-11-09T13:40:00,,2025-11-09T13:45:00,EI3322,MAN,2025-11-09T14:10:00,2025-11-09T14:15:00,,,Boarding,
68,AT7,EI-FNR,3323,3,EI3323,MAN,2025-11-09T17:00:00,,,EI3308,SOU,2025-11-09T18:00:00,,,,,
69,AT7,EI-FNS,3309,3,EI3309,SOU,2025-11-09T21:50:00,,,EI3522,GLA,2025-11-10T07:30:00,,,,,
70,AT7,EI-FCY,3325,3,EI3325,MAN,2025-11-09T13:40:00,,2025-11-09T13:38:00,EI3350,NCL,2025-11-09T14:10:00,,,,,Cleaning,
71,AT7,EI-FAX,3523,3,EI3523,GLA,2025-11-09T14:30:00,,,EI3326,MAN,2025-11-09T15:30:00,,,,,Final Approach,
72,AT7,EI-FNT,3327,3,EI3327,MAN,2025-11-09T18:25:00,,,EI3328,MAN,2025-11-09T19:00:00,,,,,
73,AT7,EI-FNU,3329,3,EI3329,MAN,2025-11-09T21:50:00,,,EI3550,EDI,2025-11-10T07:30:00,,,,,
74,AT7,EI-FAW,3331,3,EI3331,EXT,2025-11-09T14:10:00,,,EI3392,LBA,2025-11-09T15:05:00,,,,,Approaching,
75,320,EI-DVT,337,3,EI337,BER,2025-11-09T20:55:00,,,EI776,ACE,2025-11-10T06:10:00,,,,,
76,AT7,EI-FNV,3395,3,EI3395,LBA,2025-11-09T21:15:00,,,EI3390,LBA,2025-11-10T06:40:00,,,,,
77,AT7,EI-FNW,3393,3,EI3393,LBA,2025-11-09T18:05:00,,,EI3408,CFN,2025-11-09T18:50:00,,,,,
78,AT7,EI-FAV,3401,3,EI3401,CFN,2025-11-09T10:55:00,,2025-11-09T10:55:00,EI3402,CFN,2025-11-09T11:35:00,,2025-11-09T11:35:00,,,Departed
79,320,EI-DVU,587,3,EI587,AGP,2025-11-09T22:05:00,,,EI342,ZRH,2025-11-10T07:05:00,,,,,
80,320,EI-FAU,441,3,EI441,ATH,2025-11-09T15:30:00,,,EI348,ZRH,2025-11-09T16:15:00,,,,,
81,320,EI-DVV,487,3,EI487,LIS,2025-11-09T21:45:00,,,EI352,MUC,2025-11-10T06:40:00,,,,,
82,320,EI-DEI,353,3,EI353,MUC,2025-11-09T12:20:00,,2025-11-09T12:20:00,EI608,AMS,2025-11-09T13:20:00,,2025-11-09T13:20:00,,,Departed
83,320,EI-DEK,685,3,EI685,GVA,2025-11-09T15:20:00,,,EI356,MUC,2025-11-09T16:10:00,,,,,
84,320,EI-DVW,357,3,EI357,MUC,2025-11-09T21:55:00,,,EI630,BRU,2025-11-10T06:50:00,,,,,
85,320,EI-DVX,765,3,EI765,TFS,2025-11-09T23:59:00,,,EI392,HAM,2025-11-10T09:50:00,,,,,
86,320,EI-DVY,395,3,EI395,HAM,2025-11-09T22:05:00,,,EI692,DUS,2025-11-10T06:55:00,,,,,
87,320,EI-DVZ,699,3,EI699,DUS,2025-11-09T21:25:00,,,EI402,FCO,2025-11-10T06:25:00,,,,,
88,320,EI-DEM,403,3,EI403,FCO,2025-11-09T13:35:00,,2025-11-09T13:40:00,EI586,AGP,2025-11-09T15:10:00,,,,,Offloading,
89,320,EI-DEN,493,3,EI493,FAO,2025-11-09T14:10:00,,,EI406,FCO,2025-11-09T15:30:00,,,,,
90,320,EI-DVA,407,3,EI407,FCO,2025-11-09T22:25:00,,,EI482,LIS,2025-11-10T07:15:00,,,,,
91,320,EI-DVB,549,3,EI549,NCE,2025-11-09T22:25:00,,,EI432,LIN,2025-11-10T07:25:00,,,,,
92,320,EI-DEO,433,3,EI433,LIN,2025-11-09T13:25:00,,2025-11-09T13:35:00,EI764,TFS,2025-11-09T14:10:00,2025-11-09T14:25:00,,,Late Inbound,
93,320,EI-DEP,605,3,EI605,AMS,2025-11-09T14:00:00,,,EI486,LIS,2025-11-09T15:15:00,,,,,
94,333,EI-EIM,50,5,EI50,LAS,2025-11-09T13:20:00,,2025-11-09T13:15:00,,,,,,,,Towed to Hangar
95,320,EI-DVC,507,3,EI507,BOD,2025-11-09T16:20:00,,,EI698,DUS,2025-11-09T17:05:00,,,,,
96,32Q,EI-DER,521,3,EI521,CDG,2025-11-09T11:00:00,,2025-11-09T11:00:00,,,,,,,,
97,320,EI-DES,651,3,EI651,FRA,2025-11-09T12:00:00,,2025-11-09T12:05:00,EI526,CDG,2025-11-09T13:20:00,,2025-11-09T13:25:00,,,Departed
98,320,EI-DVD,609,3,EI609,AMS,2025-11-09T17:20:00,,,EI528,CDG,2025-11-09T18:00:00,,,,,
99,320,EI-DVE,529,3,EI529,CDG,2025-11-09T22:05:00,,,EI660,VIE,2025-11-10T07:00:00,,,,,
100,332,EI-DET,68,5,EI68,LAX,2025-11-09T14:30:00,2025-11-09T14:45:00,,EI53,SEA,2025-11-09T16:30:00,,,,,
101,320,EI-DVF,777,3,EI777,ACE,2025-11-09T15:35:00,,,EI548,NCE,2025-11-09T16:15:00,,,,,
102,320,EI-DVG,553,3,EI553,LYS,2025-11-09T16:05:00,,,EI564,BCN,2025-11-09T16:50:00,,,,,
103,320,EI-DVH,779,3,EI779,ACE,2025-11-09T22:15:00,,,EI562,BCN,2025-11-10T07:05:00,,,,,
104,320,EI-DVI,565,3,EI565,BCN,2025-11-09T22:50:00,,,EI642,PRG,2025-11-10T07:25:00,,,,,
105,320,EI-DEU,661,3,EI661,VIE,2025-11-09T13:30:00,,2025-11-09T13:32:00,EI574,ALC,2025-11-09T14:45:00,,,,,
106,320,EI-DVJ,575,3,EI575,ALC,2025-11-09T21:15:00,,,EI602,AMS,2025-11-10T06:15:00,,,,,
107,320,EI-DEE,657,3,EI657,FRA,2025-11-09T21:10:00,,,EI592,MAD,2025-11-10T06:15:00,,,,,
108,320,EI-DEF,749,3,EI749,BIO,2025-11-09T17:05:00,,,EI594,MAD,2025-11-09T17:45:00,,,,,
109,333,EI-DEV,60,5,EI60,SFO,2025-11-09T11:25:00,,2025-11-09T11:20:00,,,,,,,,
110,320,EI-DEW,603,3,EI603,AMS,2025-11-09T10:15:00,,2025-11-09T10:15:00,EI748,BIO,2025-11-09T12:05:00,,2025-11-09T12:05:00,,,Departed
111,320,EI-DEX,631,3,EI631,BRU,2025-11-09T11:00:00,,2025-11-09T11:05:00,EI634,BRU,2025-11-09T12:50:00,,2025-11-09T12:55:00,,,Departed
112,320,EI-DEY,635,3,EI635,BRU,2025-11-09T16:50:00,,,EI638,BRU,2025-11-09T17:30:00,,,,,
113,320,EI-DEY,643,3,EI643,PRG,2025-11-09T13:20:00,,2025-11-09T13:20:00,EI756,SVQ,2025-11-09T14:10:00,,,,,
114,320,EI-DEZ,771,3,EI771,FUE,2025-11-09T00:25:00,,2025-11-09T00:30:00,EI684,GVA,2025-11-09T10:00:00,,2025-11-09T10:05:00,,,Departed
115,320,EI-DFA,693,3,EI693,DUS,2025-11-09T11:25:00,,2025-11-09T11:25:00,EI778,ACE,2025-11-09T12:50:00,,2025-11-09T12:50:00,,,Departed
116,320,EI-DEG,757,3,EI757,SVQ,2025-11-09T20:45:00,,,,,,,,,,,
117,32Q,EI-LRA,76,3,EI76,BNA,2025-11-09T08:50:00,,2025-11-09T08:45:00,,,,,,,,Towed to Hangar
118,32Q,EI-LRB,82,3,EI82,IND,2025-11-09T08:45:00,,2025-11-09T08:45:00,,,,,,,,
119,32N,VY-EAB,8578,3,VY8578,ORY,2025-11-09T07:45:00,,,VY8579,ORY,2025-11-09T08:25:00,,,,,
120,320,IB-JKS,1881,3,IB1881,MAD,2025-11-09T08:55:00,,,IB1882,MAD,2025-11-09T09:40:00,,,,,
121,32Q,BA-GTT,828,3,BA828,LHR,2025-11-09T09:50:00,,,BA829,LHR,2025-11-09T10:45:00,,,,,
122,32N,VY-GAA,8720,3,VY8720,BCN,2025-11-09T12:40:00,,,VY8721,BCN,2025-11-09T13:20:00,,,,,
123,320,BA-EUU,834,3,BA834,LHR,2025-11-09T12:45:00,,,BA831,LHR,2025-11-09T13:40:00,,,,,
124,32Q,BA-EUY,836,3,BA836,LHR,2025-11-09T14:15:00,,,BA827,LHR,2025-11-09T15:05:00,,,,,
125,E91,BA-LCY,4468,3,BA4468,LCY,2025-11-09T14:35:00,,,BA4467,LCY,2025-11-09T15:15:00,,,,,
126,320,G-EUUZ,830,3,BA830,LHR,2025-11-09T15:00:00,,,BA833,LHR,2025-11-09T15:55:00,,,,,
127,320,G-EUUA,824,3,BA824,LHR,2025-11-09T17:40:00,,,BA835,LHR,2025-11-09T18:30:00,,,,,
128,320,G-EUUB,824,3,BA824,LHR,2025-11-09T18:40:00,,,BA837,LHR,2025-11-09T19:25:00,,,,,
129,E91,G-LCYA,4468,3,BA4468,LCY,2025-11-09T19:25:00,,,BA4473,LCY,2025-11-09T20:05:00,,,,,
130,320,G-EUUC,824,3,BA824,LHR,2025-11-09T19:45:00,,,BA839,LHR,2025-11-09T20:40:00,,,,,
131,E91,G-LCYB,4470,3,BA4470,LCY,2025-11-09T20:45:00,,,,,,,,,,,
`;

export const MOCK_TEAMS: Team[] = [
  {
    id: 'team_1',
    name: 'Crew 1',
    shiftStartHour: 4,
    shiftEndHour: 12,
    members: [
      { name: 'Sadhbh O\'Neill', skill: Skill.LEADER, startHour: 4 },
      { name: 'Cormac Moore', skill: Skill.DRIVER, startHour: 4 },
      { name: 'Riona Walsh', skill: Skill.HEADSET, startHour: 4 },
      { name: 'Aisling Moore', skill: Skill.LOADER, startHour: 4 },
      { name: 'Nuala Kennedy', skill: Skill.LOADER, startHour: 4 }
    ]
  },
  {
    id: 'team_2',
    name: 'Crew 2',
    shiftStartHour: 4,
    shiftEndHour: 12,
    members: [
      { name: 'Fionnuala Kelly', skill: Skill.LEADER, startHour: 4 },
      { name: 'Aisling Murray', skill: Skill.DRIVER, startHour: 4 },
      { name: 'Tara O\'Neill', skill: Skill.HEADSET, startHour: 4 },
      { name: 'Niall Kennedy', skill: Skill.LOADER, startHour: 4 },
      { name: 'Rory Daly', skill: Skill.LOADER, startHour: 4 }
    ]
  },
  {
    id: 'team_3',
    name: 'Crew 3',
    shiftStartHour: 4,
    shiftEndHour: 12,
    members: [
      { name: 'Blathnaid O\'Sullivan', skill: Skill.LEADER, startHour: 4 },
      { name: 'Sorcha McCarthy', skill: Skill.DRIVER, startHour: 4 },
      { name: 'Nuala O\'Reilly', skill: Skill.HEADSET, startHour: 4 },
      { name: 'Rory Johnston', skill: Skill.LOADER, startHour: 4 },
      { name: 'Aisling McMahon', skill: Skill.LOADER, startHour: 4 }
    ]
  },
  {
    id: 'team_4',
    name: 'Crew 4',
    shiftStartHour: 13,
    shiftEndHour: 21,
    members: [
      { name: 'Conor Clarke', skill: Skill.LEADER, startHour: 13 },
      { name: 'Fionnuala Gallagher', skill: Skill.DRIVER, startHour: 13 },
      { name: 'Ronan McLoughlin', skill: Skill.HEADSET, startHour: 13 },
      { name: 'Nuala Hughes', skill: Skill.LOADER, startHour: 13 },
      { name: 'Conor O\'Connor', skill: Skill.LOADER, startHour: 13 }
    ]
  },
  {
    id: 'team_5',
    name: 'Crew 5',
    shiftStartHour: 5,
    shiftEndHour: 13,
    members: [
      { name: 'Riona Thompson', skill: Skill.LEADER, startHour: 5 },
      { name: 'Declan Browne', skill: Skill.DRIVER, startHour: 5 },
      { name: 'Aisling Kennedy', skill: Skill.HEADSET, startHour: 5 },
      { name: 'Blathnaid Browne', skill: Skill.LOADER, startHour: 5 },
      { name: 'Fionnuala O\'Brien', skill: Skill.LOADER, startHour: 5 }
    ]
  },
  {
    id: 'team_6',
    name: 'Crew 6',
    shiftStartHour: 5,
    shiftEndHour: 13,
    members: [
      { name: 'Caoimhe Doherty', skill: Skill.LEADER, startHour: 5 },
      { name: 'Grainne Johnston', skill: Skill.DRIVER, startHour: 5 },
      { name: 'Cara Martin', skill: Skill.HEADSET, startHour: 5 },
      { name: 'Fionnuala Martin', skill: Skill.LOADER, startHour: 5 },
      { name: 'Sadhbh Johnston', skill: Skill.LOADER, startHour: 5 }
    ]
  },
  {
    id: 'team_7',
    name: 'Crew 7',
    shiftStartHour: 5,
    shiftEndHour: 13,
    members: [
      { name: 'Eimear McLoughlin', skill: Skill.LEADER, startHour: 5 },
      { name: 'Sorcha Browne', skill: Skill.DRIVER, startHour: 5 },
      { name: 'Nuala Lynch', skill: Skill.HEADSET, startHour: 5 },
      { name: 'Donal O\'Connor', skill: Skill.LOADER, startHour: 5 },
      { name: 'Oisin McLoughlin', skill: Skill.LOADER, startHour: 5 }
    ]
  },
  {
    id: 'team_8',
    name: 'Crew 8',
    shiftStartHour: 5,
    shiftEndHour: 13,
    members: [
      { name: 'Nuala Farrell', skill: Skill.LEADER, startHour: 5 },
      { name: 'Rory McLoughlin', skill: Skill.DRIVER, startHour: 5 },
      { name: 'Brendan O\'Neill', skill: Skill.HEADSET, startHour: 5 },
      { name: 'Maeve O\'Sullivan', skill: Skill.LOADER, startHour: 5 },
      { name: 'Nuala Brennan', skill: Skill.LOADER, startHour: 5 }
    ]
  },
  {
    id: 'team_9',
    name: 'Crew 9',
    shiftStartHour: 6,
    shiftEndHour: 14,
    members: [
      { name: 'Peadar Doherty', skill: Skill.LEADER, startHour: 6 },
      { name: 'Brendan Kelly', skill: Skill.DRIVER, startHour: 6 },
      { name: 'Cian Browne', skill: Skill.HEADSET, startHour: 6 },
      { name: 'Aoibhinn O\'Connor', skill: Skill.LOADER, startHour: 6 },
      { name: 'Liam Farrell', skill: Skill.LOADER, startHour: 6 }
    ]
  },
  {
    id: 'team_10',
    name: 'Crew 10',
    shiftStartHour: 6,
    shiftEndHour: 14,
    members: [
      { name: 'Cathal O\'Reilly', skill: Skill.LEADER, startHour: 6 },
      { name: 'Ciaran O\'Brien', skill: Skill.DRIVER, startHour: 6 },
      { name: 'Maeve O\'Brien', skill: Skill.HEADSET, startHour: 6 },
      { name: 'Sadhbh O\'Reilly', skill: Skill.LOADER, startHour: 6 },
      { name: 'Aoife Johnston', skill: Skill.LOADER, startHour: 6 }
    ]
  },
  {
    id: 'team_11',
    name: 'Crew 11',
    shiftStartHour: 6,
    shiftEndHour: 14,
    members: [
      { name: 'Saoirse McMahon', skill: Skill.LEADER, startHour: 6 },
      { name: 'Sadhbh Doherty', skill: Skill.DRIVER, startHour: 6 },
      { name: 'Siobhan Thompson', skill: Skill.HEADSET, startHour: 6 },
      { name: 'Cathal Murray', skill: Skill.LOADER, startHour: 6 },
      { name: 'Ciara Maguire', skill: Skill.LOADER, startHour: 6 }
    ]
  },
  {
    id: 'team_12',
    name: 'Crew 12',
    shiftStartHour: 6,
    shiftEndHour: 14,
    members: [
      { name: 'Aideen Lynch', skill: Skill.LEADER, startHour: 6 },
      { name: 'Shane O\'Brien', skill: Skill.DRIVER, startHour: 6 },
      { name: 'Kevin Murray', skill: Skill.HEADSET, startHour: 6 },
      { name: 'Riona Martin', skill: Skill.LOADER, startHour: 6 },
      { name: 'Aidan Burke', skill: Skill.LOADER, startHour: 6 }
    ]
  },
  {
    id: 'team_13',
    name: 'Crew 13',
    shiftStartHour: 5,
    shiftEndHour: 13,
    members: [
      { name: 'Rory McCarthy', skill: Skill.LEADER, startHour: 5 },
      { name: 'Conor Moore', skill: Skill.DRIVER, startHour: 5 },
      { name: 'Brendan Martin', skill: Skill.HEADSET, startHour: 5 },
      { name: 'Liam O\'Reilly', skill: Skill.LOADER, startHour: 5 },
      { name: 'Riona Hughes', skill: Skill.LOADER, startHour: 5 }
    ]
  },
  {
    id: 'team_14',
    name: 'Crew 14',
    shiftStartHour: 14,
    shiftEndHour: 22,
    members: [
      { name: 'Dara Hughes', skill: Skill.LEADER, startHour: 14 },
      { name: 'Deirdre Farrell', skill: Skill.DRIVER, startHour: 14 },
      { name: 'Clodagh O\'Brien', skill: Skill.HEADSET, startHour: 14 },
      { name: 'Nuala O\'Connor', skill: Skill.LOADER, startHour: 14 },
      { name: 'Sadhbh O\'Sullivan', skill: Skill.LOADER, startHour: 14 }
    ]
  },
  {
    id: 'team_15',
    name: 'Crew 15',
    shiftStartHour: 11,
    shiftEndHour: 19,
    members: [
      { name: 'Conor Ryan', skill: Skill.LEADER, startHour: 11 },
      { name: 'Fionnuala Burke', skill: Skill.DRIVER, startHour: 11 },
      { name: 'Cathal O\'Neill', skill: Skill.HEADSET, startHour: 11 },
      { name: 'Ciaran Kennedy', skill: Skill.LOADER, startHour: 11 },
      { name: 'Peadar O\'Neill', skill: Skill.LOADER, startHour: 11 }
    ]
  },
  {
    id: 'team_16',
    name: 'Crew 16',
    shiftStartHour: 15,
    shiftEndHour: 23,
    members: [
      { name: 'Roisin O\'Reilly', skill: Skill.LEADER, startHour: 15 },
      { name: 'Nuala Walsh', skill: Skill.DRIVER, startHour: 15 },
      { name: 'Donal Kennedy', skill: Skill.HEADSET, startHour: 15 },
      { name: 'Shane Walsh', skill: Skill.LOADER, startHour: 15 },
      { name: 'Kevin McLoughlin', skill: Skill.LOADER, startHour: 15 }
    ]
  },
  {
    id: 'team_17',
    name: 'Crew 17',
    shiftStartHour: 8,
    shiftEndHour: 16,
    members: [
      { name: 'Declan McMahon', skill: Skill.LEADER, startHour: 8 },
      { name: 'Aisling Quinn', skill: Skill.DRIVER, startHour: 8 },
      { name: 'Nuala Nolan', skill: Skill.HEADSET, startHour: 8 },
      { name: 'Seamus Quinn', skill: Skill.LOADER, startHour: 8 },
      { name: 'Sinead Lynch', skill: Skill.LOADER, startHour: 8 }
    ]
  },
  {
    id: 'team_18',
    name: 'Crew 18',
    shiftStartHour: 8,
    shiftEndHour: 16,
    members: [
      { name: 'Sinead Hughes', skill: Skill.LEADER, startHour: 8 },
      { name: 'Siobhan Martin', skill: Skill.DRIVER, startHour: 8 },
      { name: 'Aisling McLoughlin', skill: Skill.HEADSET, startHour: 8 },
      { name: 'Patrick Quinn', skill: Skill.LOADER, startHour: 8 },
      { name: 'Sorcha Burke', skill: Skill.LOADER, startHour: 8 }
    ]
  },
  {
    id: 'team_19',
    name: 'Crew 19',
    shiftStartHour: 16,
    shiftEndHour: 0,
    members: [
      { name: 'Kevin Farrell', skill: Skill.LEADER, startHour: 16 },
      { name: 'Peadar O\'Sullivan', skill: Skill.DRIVER, startHour: 16 },
      { name: 'Aisling Martin', skill: Skill.HEADSET, startHour: 16 },
      { name: 'Donal McLoughlin', skill: Skill.LOADER, startHour: 16 },
      { name: 'Cormac Farrell', skill: Skill.LOADER, startHour: 16 }
    ]
  },
  {
    id: 'team_20',
    name: 'Crew 20',
    shiftStartHour: 12,
    shiftEndHour: 20,
    members: [
      { name: 'Oisin Johnston', skill: Skill.LEADER, startHour: 12 },
      { name: 'Eimear Martin', skill: Skill.DRIVER, startHour: 12 },
      { name: 'Conor Doherty', skill: Skill.HEADSET, startHour: 12 },
      { name: 'Peadar Burke', skill: Skill.LOADER, startHour: 12 },
      { name: 'Sean O\'Sullivan', skill: Skill.LOADER, startHour: 12 }
    ]
  },
  {
    id: 'team_21',
    name: 'Crew 21',
    shiftStartHour: 9,
    shiftEndHour: 17,
    members: [
      { name: 'Donal Hughes', skill: Skill.LEADER, startHour: 9 },
      { name: 'Grainne Collins', skill: Skill.DRIVER, startHour: 9 },
      { name: 'Aisling O\'Sullivan', skill: Skill.HEADSET, startHour: 9 },
      { name: 'Dara Walsh', skill: Skill.LOADER, startHour: 9 },
      { name: 'Brendan Clarke', skill: Skill.LOADER, startHour: 9 }
    ]
  },
  {
    id: 'team_22',
    name: 'Crew 22',
    shiftStartHour: 9,
    shiftEndHour: 17,
    members: [
      { name: 'Niamh Lynch', skill: Skill.LEADER, startHour: 9 },
      { name: 'Niall Farrell', skill: Skill.DRIVER, startHour: 9 },
      { name: 'Fionnuala Hughes', skill: Skill.HEADSET, startHour: 9 },
      { name: 'Diarmuid Ryan', skill: Skill.LOADER, startHour: 9 },
      { name: 'Peadar Martin', skill: Skill.LOADER, startHour: 9 }
    ]
  },
  {
    id: 'team_23',
    name: 'Crew 23',
    shiftStartHour: 9,
    shiftEndHour: 17,
    members: [
      { name: 'Fionnuala Clarke', skill: Skill.LEADER, startHour: 9 },
      { name: 'Fionnuala Daly', skill: Skill.DRIVER, startHour: 9 },
      { name: 'Sadhbh Kelly', skill: Skill.HEADSET, startHour: 9 },
      { name: 'Roisin Lynch', skill: Skill.LOADER, startHour: 9 },
      { name: 'Sinead Thompson', skill: Skill.LOADER, startHour: 9 }
    ]
  },
  {
    id: 'team_24',
    name: 'Crew 24',
    shiftStartHour: 9,
    shiftEndHour: 17,
    members: [
      { name: 'Ronan Kelly', skill: Skill.LEADER, startHour: 9 },
      { name: 'Rory Burke', skill: Skill.DRIVER, startHour: 9 },
      { name: 'Roisin Kennedy', skill: Skill.HEADSET, startHour: 9 },
      { name: 'Maeve McLoughlin', skill: Skill.LOADER, startHour: 9 },
      { name: 'Cathal Kennedy', skill: Skill.LOADER, startHour: 9 }
    ]
  },
  {
    id: 'team_25',
    name: 'Crew 25',
    shiftStartHour: 10,
    shiftEndHour: 18,
    members: [
      { name: 'Aoibhinn Farrell', skill: Skill.LEADER, startHour: 10 },
      { name: 'Diarmuid Kelly', skill: Skill.DRIVER, startHour: 10 },
      { name: 'Diarmuid Farrell', skill: Skill.HEADSET, startHour: 10 },
      { name: 'Niamh O\'Reilly', skill: Skill.LOADER, startHour: 10 },
      { name: 'Finn Doherty', skill: Skill.LOADER, startHour: 10 }
    ]
  },
  {
    id: 'team_26',
    name: 'Crew 26',
    shiftStartHour: 10,
    shiftEndHour: 18,
    members: [
      { name: 'Cian O\'Sullivan', skill: Skill.LEADER, startHour: 10 },
      { name: 'Roisin Martin', skill: Skill.DRIVER, startHour: 10 },
      { name: 'Maeve O\'Reilly', skill: Skill.HEADSET, startHour: 10 },
      { name: 'Aideen Browne', skill: Skill.LOADER, startHour: 10 },
      { name: 'Riona Kennedy', skill: Skill.LOADER, startHour: 10 }
    ]
  },
  {
    id: 'team_27',
    name: 'Crew 27',
    shiftStartHour: 10,
    shiftEndHour: 18,
    members: [
      { name: 'Brendan Ryan', skill: Skill.LEADER, startHour: 10 },
      { name: 'Aisling Ryan', skill: Skill.DRIVER, startHour: 10 },
      { name: 'Fionnuala Connolly', skill: Skill.HEADSET, startHour: 10 },
      { name: 'Nuala O\'Brien', skill: Skill.LOADER, startHour: 10 },
      { name: 'Siobhan Moore', skill: Skill.LOADER, startHour: 10 }
    ]
  }
];