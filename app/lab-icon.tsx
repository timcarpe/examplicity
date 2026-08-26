type LabIconProps = {
  slug: string;
};

function IconDrawing({ slug }: LabIconProps) {
  switch (slug) {
    case 'binary-numbers':
      return (
        <>
          <path d="M72 126h496" />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((cell) => (
            <rect className={cell === 0 || cell === 3 || cell === 5 ? 'is-solid' : ''} height="64" key={cell} rx="14" width="50" x={82 + cell * 60} y="96" />
          ))}
          <path d="M246 216h148m-26-24 26 24-26 24" />
          <circle cx="218" cy="216" r="11" />
          <circle className="is-solid" cx="422" cy="216" r="11" />
        </>
      );
    case 'bitmap-compression':
      return (
        <>
          <g className="thin-lines">
            {[0, 1, 2, 3].map((row) => [0, 1, 2, 3].map((column) => (
              <rect className={(row + column) % 3 === 0 ? 'is-solid' : ''} height="40" key={`${row}-${column}`} width="40" x={92 + column * 42} y={86 + row * 42} />
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
            <circle className={index % 2 === 0 ? 'is-solid' : ''} cx={x} cy={index % 2 === 0 ? 110 : 254} key={x} r="10" />
          ))}
        </>
      );
    case 'huffman-rover':
      return (
        <>
          <path d="M320 74v46m0 0-104 58m104-58 104 58m-208 0-60 66m60-66 52 66m156-66-52 66m52-66 60 66" />
          <circle className="is-solid" cx="320" cy="70" r="15" />
          {[156, 268, 372, 484].map((x) => <circle cx={x} cy="246" key={x} r="18" />)}
          <path d="M238 300h164" />
          <path className="is-solid" d="M294 274h66l18 26h-102z" />
          <circle className="is-solid" cx="292" cy="310" r="12" />
          <circle className="is-solid" cx="362" cy="310" r="12" />
        </>
      );
    case 'parity-arq':
      return (
        <>
          <path d="M90 120h416" />
          {[0, 1, 2, 3, 4, 5].map((cell) => (
            <rect className={cell === 4 ? 'is-solid' : ''} height="72" key={cell} rx="12" width="62" x={104 + cell * 66} y="84" />
          ))}
          <path d="M506 120h56m-22-22 22 22-22 22M502 250H142c-42 0-58-18-58-52m0 0 22 24m-22-24-22 24" />
          <circle cx="506" cy="250" r="13" />
          <circle className="is-solid" cx="142" cy="250" r="13" />
        </>
      );
    case 'network-topology':
      return (
        <>
          <path d="M320 180 164 98m156 82 156-82M320 180 164 262m156-82 156 82" />
          <path className="secondary-line" d="M164 98v164m312-164v164M164 98h312M164 262h312" />
          <circle className="is-solid" cx="320" cy="180" r="34" />
          {[[164, 98], [476, 98], [164, 262], [476, 262]].map(([x, y]) => <circle cx={x} cy={y} key={`${x}-${y}`} r="24" />)}
        </>
      );
    case 'csma-cd':
      return (
        <>
          <path d="M72 188h496M128 188v-76m384 76v-76" />
          <rect height="48" rx="12" width="84" x="86" y="70" />
          <rect height="48" rx="12" width="84" x="470" y="70" />
          <path d="m282 188 38-38 38 38-38 38z" />
          <path className="is-solid" d="m302 170 18-18 18 18-18 18z" />
          <path d="M126 248h74m-24-20 24 20-24 20m338-20h-74m24-20-24 20 24 20" />
        </>
      );
    case 'fetch-decode-execute':
      return (
        <>
          <rect className="is-solid" height="116" rx="24" width="146" x="247" y="122" />
          <rect height="56" rx="12" width="92" x="82" y="152" />
          <rect height="56" rx="12" width="92" x="466" y="152" />
          <path d="M174 180h73m146 0h73M320 122V72m0 0-20 22m20-22 20 22" />
          <path d="M250 274c-72-30-112-80-112-138m0 0-18 28m18-28 26 21M390 86c70 28 110 78 112 136m0 0 18-28m-18 28-26-21" />
        </>
      );
    case 'assembly':
      return (
        <>
          <rect height="42" rx="10" width="196" x="76" y="84" />
          <rect className="is-solid" height="42" rx="10" width="154" x="76" y="146" />
          <rect height="42" rx="10" width="176" x="76" y="208" />
          <path d="M272 167h80m-24-22 24 22-24 22" />
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
          <rect className="is-solid" height="42" rx="12" width="270" x="185" y="142" />
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
              <rect className={row === 1 && column === 0 ? 'is-solid' : ''} height="56" key={`r-${row}-${column}`} rx="8" width="56" x={370 + column * 60} y={108 + row * 60} />
            )))}
          </g>
          <path d="M250 270c38 42 102 42 140 0m0 0-6 32m6-32-32 4" />
          <path className="secondary-line" d="M400 78h112" />
          <circle cx="422" cy="78" r="9" />
          <circle className="is-solid" cx="458" cy="78" r="9" />
          <circle cx="494" cy="78" r="9" />
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
