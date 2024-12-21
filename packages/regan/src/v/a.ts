// const a = [
//   {
//     time: {
//       from: 1.45,
//       to: 1.46,
//     },
//   },
// ];

type Time = {
  // milliseconds
  from: number;
  to: number;
};

type ActionVariants = {
  type: 'click';
  // проценты
  position: {
    top: number;
    left: number;
    bottom: number;
    right: number;
  };
};

type Area = {
  type: 'area';
  time: Time;
  urls: string[];
};

type Hanlder = {
  type: 'handler';
  time: Time;
  action: ActionVariants;
  reaction: {
    urls: string[];
  };
};

type Fragment = {};

const b = {
  areas: [
    {
      time: null as any as Time,
      urls: null as any as string[],
    },
  ],
  handlers: [
    {
      time: null as any as Time,
      action: null as any as ActionVariants,
      reaction: null as any as {
        urls: string[];
      },
    },
  ],
};
