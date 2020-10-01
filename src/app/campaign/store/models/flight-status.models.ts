export interface FlightStatusOption {
  name: string;
  value: string;
}

export const flightStatusTransitions = {
  draft: ['hold', 'sold', 'approved'],
  hold: ['draft', 'sold', 'approved'],
  sold: ['draft', 'hold', 'approved'],
  approved: ['paused', 'canceled'],
  paused: ['approved', 'canceled'],
  completed: ['approved'],
  unfulfilled: ['approved']
};

export const flightStatusOptions = (status: string): FlightStatusOption[] => {
  if (status) {
    const allowed = [status].concat(flightStatusTransitions[status] || []);
    return allowed.map(value => ({ name: value.charAt(0).toUpperCase() + value.slice(1), value }));
  } else {
    return flightStatusOptions('draft');
  }
};
