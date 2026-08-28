type LabIconProps = {
  slug: string;
};

function IconDrawing({ slug }: LabIconProps) {
  switch (slug) {
    case 'binary-numbers':
      return (
        <>
          <g className="thin-lines">
            {[
              { bits: '10110110', y: 70 },
              { bits: '00101101', y: 132 },
              { bits: '11100011', y: 222 },
            ].map(({ bits, y }, row) => [...bits].map((bit, column) => {
              const isAccent = row === 2 && column === 2;
              return (
                <g className={isAccent ? 'tone-one' : undefined} key={`${row}-${column}`}>
                  <rect className={isAccent ? 'is-solid' : undefined} height="42" rx="8" width="46" x={122 + column * 50} y={y} />
                  <text fill={isAccent ? 'var(--paper)' : 'currentColor'} fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="22" fontWeight="800" stroke="none" textAnchor="middle" x={145 + column * 50} y={y + 29}>{bit}</text>
                </g>
              );
            }))}
          </g>
          <path d="M82 153h24m-12-12v24M104 194h432" />
        </>
      );
    case 'bitmap-compression':
      return (
        <>
          <g className="thin-lines">
            {[0, 1, 2, 3].map((row) => [0, 1, 2, 3].map((column) => (
              <rect className={row === 1 && column === 2 ? 'is-solid tone-two' : (row + column) % 3 === 0 ? 'is-solid' : ''} height="40" key={`${row}-${column}`} width="40" x={92 + column * 42} y={86 + row * 42} />
            )))}
          </g>
          <path d="M298 170h74m-22-22 22 22-22 22" />
          <rect height="38" rx="12" width="170" x="398" y="102" />
          <rect className="is-solid" height="38" rx="12" width="122" x="398" y="160" />
          <rect height="38" rx="12" width="82" x="398" y="218" />
        </>
      );
    case 'sound-sampling':
      return (
        <>
          <path d="M58 182c38 0 38-102 76-102s38 204 76 204 38-204 76-204 38 204 76 204 38-204 76-204 38 102 76 102h68" />
          <path className="secondary-line" d="M58 182h76v-72h76v144h76V110h76v144h76v-72h144" />
          {[134, 210, 286, 362, 438, 514].map((x, index) => (
            <circle className={`${index % 2 === 0 ? 'is-solid' : ''}${index === 2 ? ' tone-three' : ''}`} cx={x} cy={index % 2 === 0 ? 110 : 254} key={x} r="10" />
          ))}
        </>
      );
    case 'huffman-rover':
      return (
        <>
          <path d="M54 126h532" />
          {[70, 108, 164, 202, 240, 296, 352, 390, 446, 484, 522].map((x, index) => (
            <rect className={[0, 3, 4, 6, 9].includes(index) ? 'is-solid' : ''} height="34" key={x} rx="8" width="30" x={x} y="82" />
          ))}
          <path d="M252 126h136l-34 62h-68zM320 188v42m-18-20 18 20 18-20" />
          <path className="secondary-line" d="M388 270h78v-72h92" />
          <path className="is-solid" d="M270 242h94l22 34H248z" />
          <path d="M286 242v-18h42l18 18" />
          <circle className="is-solid" cx="278" cy="286" r="13" />
          <circle className="is-solid" cx="356" cy="286" r="13" />
          <path className="tone-four" d="M548 198v-54m0 8 34 15-34 16" />
          <circle cx="548" cy="136" r="9" />
        </>
      );
    case 'parity-arq':
      return (
        <>
          <g className="thin-lines">
            <rect height="72" rx="12" width="448" x="70" y="102" />
            {[1, 2, 3, 4, 5, 6, 7].map((cell) => <path d={`M${70 + cell * 56} 102v72`} key={cell} />)}
          </g>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((cell) => (
            <circle className={[0, 2, 3, 6].includes(cell) ? 'is-solid' : ''} cx={98 + cell * 56} cy="138" key={cell} r="11" />
          ))}
          <path d="M530 138h52m-18-16 18 16-18 16" />
          <path className="is-solid tone-one" d="m322 74 8 18 20-6-11 18 17 10-20 4 2 21-16-14-16 14 2-21-20-4 17-10-11-18 20 6z" />
          <path d="M542 202v34c0 42-30 62-76 62H134c-46 0-68-20-68-58m0 0 22 24m-22-24-22 24" />
        </>
      );
    case 'network-topology':
      return (
        <>
          <path className="secondary-line" d="M156 108 286 166M156 252l130-58" />
          <path d="M354 180h130" />
          <rect className="is-solid tone-two" height="72" rx="14" width="92" x="274" y="144" />
          {[102, 252].map((y) => (
            <g key={y}>
              <rect height="54" rx="9" width="92" x="64" y={y - 27} />
              <path d={`M110 ${y + 27}v12m-28 0h56`} />
            </g>
          ))}
          <rect height="64" rx="10" width="106" x="484" y="148" />
          <path d="M537 212v13m-30 0h60" />
          <circle className="is-solid" cx="426" cy="180" r="12" />
          <path d="M300 166h12m16 0h12m-40 14h40m-40 14h12m16 0h12" />
        </>
      );
    case 'csma-cd':
      return (
        <>
          <path d="M58 190h524M110 190v-66m210 66v-66m210 66v-66" />
          {[110, 320, 530].map((x) => (
            <g key={x}>
              <rect height="48" rx="10" width="82" x={x - 41} y="72" />
              <path d={`M${x} 120v4m-24 0h48`} />
            </g>
          ))}
          <path d="M88 190h162m-22-20 22 20-22 20M552 190H390m22-20-22 20 22 20" />
          <path className="is-solid tone-three" d="m320 150 10 24 26-8-14 24 22 14-26 4 2 27-20-18-20 18 2-27-26-4 22-14-14-24 26 8z" />
          <path className="secondary-line" d="M92 264c54 38 118 38 172 0m-22 0h22v22M548 264c-54 38-118 38-172 0m22 0h-22v22" />
          <circle cx="150" cy="278" r="7" />
          <circle cx="476" cy="278" r="7" />
          <circle cx="500" cy="278" r="7" />
        </>
      );
    case 'fetch-decode-execute':
      return (
        <>
          <path className="tone-four" d="M210 102c64-42 156-42 220 0m0 0-26-3m26 3-14-22" strokeWidth="6" />
          <path d="M472 134c38 76-7 152-90 166m0 0 21-17m-21 17 25 9" strokeWidth="6" />
          <path d="M258 300c-83-14-128-90-90-166M170 159l-2-25-21 14" strokeWidth="6" />
          <circle cx="320" cy="190" r="40" />
          <path d="M320 166v24l19 13" />
          <circle className="is-solid" cx="320" cy="190" r="5" />
        </>
      );
    case 'assembly':
      return (
        <>
          <rect height="42" rx="10" width="196" x="76" y="84" />
          <rect className="is-solid tone-one" height="42" rx="10" width="154" x="76" y="146" />
          <rect height="42" rx="10" width="176" x="76" y="208" />
          <path d="M288 167h64m-22-20 22 20-22 20" />
          <rect height="178" rx="28" width="154" x="410" y="80" />
          <path d="M448 128h78m-78 44h78m-78 44h48" />
          <circle className="is-solid" cx="524" cy="216" r="12" />
        </>
      );
    case 'software-stack':
      return (
        <>
          <path className="secondary-line" d="M320 54v46m-18-18 18 18 18-18" />
          <rect height="42" rx="12" width="216" x="212" y="96" />
          <rect className="is-solid tone-two" height="42" rx="12" width="270" x="185" y="142" />
          <rect height="42" rx="12" width="320" x="160" y="188" />
          <rect className="is-solid" height="42" rx="12" width="370" x="135" y="234" />
          <path d="M320 276v38m-18-18 18 18 18-18" />
        </>
      );
    case 'memory-management':
      return (
        <>
          <path d="M320 72v216" />
          <g className="thin-lines">
            {[0, 1].map((row) => [0, 1, 2].map((column) => (
              <rect className={row === 0 && column === 2 ? 'is-solid' : ''} height="56" key={`l-${row}-${column}`} rx="8" width="56" x={90 + column * 60} y={108 + row * 60} />
            )))}
            {[0, 1].map((row) => [0, 1, 2].map((column) => (
              <rect className={row === 1 && column === 0 ? 'is-solid tone-three' : ''} height="56" key={`r-${row}-${column}`} rx="8" width="56" x={370 + column * 60} y={108 + row * 60} />
            )))}
          </g>
          <path d="M250 270c38 42 102 42 140 0m0 0-6 32m6-32-32 4" />
          <path className="secondary-line" d="M400 78h112" />
          <circle cx="422" cy="78" r="9" />
          <circle className="is-solid" cx="458" cy="78" r="9" />
          <circle cx="494" cy="78" r="9" />
        </>
      );
    case 'translator':
      return (
        <>
          <rect height="190" rx="22" width="220" x="58" y="82" />
          <rect className="tone-one" height="190" rx="22" width="220" x="362" y="82" />
          <path className="secondary-line" d="M92 122h88m-88 36h128m-128 36h106m-106 36h142M396 122h76m-76 36h142m-142 36h112m-112 36h136" />
          <path d="m126 142-24 20 24 20m64-40 24 20-24 20M428 142l-24 20 24 20m64-40 24 20-24 20" />
          <path className="is-solid tone-one" d="M302 150h36v-22l42 52-42 52v-22h-36v22l-42-52 42-52z" />
        </>
      );
    default:
      return <path d="M160 180h320M320 88v184M210 116l220 128m0-128L210 244" />;
  }
}

export function LabIcon({ slug }: LabIconProps) {
  return (
    <svg aria-hidden="true" className="lab-icon" fill="none" viewBox="0 0 640 360">
      <g className="icon-drawing">
        <IconDrawing slug={slug} />
      </g>
    </svg>
  );
}
