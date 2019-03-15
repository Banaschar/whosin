var roomSize = {
    'Room3170A': 90,
    'Room3170B': 113,
    'Room3140A': 100,
    'Room3140B': 70,
    'Room4120': 100,
    'Room4124A': 50,
    'Room4140A': 160,
    'Room4140B': 78,
    'Room4145-4151': 65,
    'Room4168': 67,
    'Room4170A': 75,
    'Room4170B': 50
};

var roomCap = {
    'Room3170A': 18,
    'Room3170B': 26,
    'Room3140A': 31,
    'Room3140B': 18,
    'Room4120': 9,
    'Room4124A': 0,
    'Room4140A': 72,
    'Room4140B': 26,
    'Room4145-4151': 26,
    'Room4168': 0,
    'Room4170A': 18,
    'Room4170B': 9
};

var roomAp = {
    'Room3170A': 'apa01-3bb',
    'Room3170B': 'apa01-3bb',
    'Room3140A': 'apa02-3bb',
    'Room3140B': 'apa02-3bb',
    'Room4120': 'apa01-4bb',
    'Room4124A': 'apa01-4bb',
    'Room4140A': 'apa01-4bb',
    'Room4140B': 'apa01-4bb',
    'Room4145-4151': 'apa03-4bb',
    'Room4168': 'apa03-4bb',
    'Room4170A': 'apa03-4bb',
    'Room4170B': 'apa03-4bb'
};

var apRooms = {
    'apa01-3bb': ['Room3170A', 'Room3170B'],
    'apa02-3bb': ['Room3140A', 'Room3140B'],
    'apa01-4bb': ['Room4120', 'Room4124A', 'Room4140A', 'Room4140B'],
    'apa03-4bb': ['Room4145-4151', 'Room4168', 'Room4170A', 'Room4170B']
};

function getRoomCapacity(room) {
    return roomCap[room];
}

function getRoomAp(room) {
    return roomAp[room];
}

function getApRooms(ap) {
    return apRooms[ap];
}

export {getRoomCapacity, getRoomAp, getApRooms}