import type { Team } from './types';
import { Skill } from './types';

export const SNAPSHOT_URL = 'https://api.daa.ie/dub/aops/flightdata/operational/v1/carrier/EI,BA,IB,VY,I2,AA,T2';
export const UPDATES_URL = 'https://api.daa.ie/dub/aops/flightdata/operational/v1/updates';

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