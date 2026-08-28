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
    case 'dns-url-retrieval':
      return (
        <>
          <rect height="150" rx="18" width="190" x="54" y="104" />
          <path className="secondary-line" d="M54 144h190M82 124h16m14 0h16M84 182h126m-126 34h92" />
          <path d="M260 180h70m-20-20 20 20-20 20" />
          <rect className="is-solid tone-two" height="128" rx="18" width="126" x="338" y="116" />
          <path d="M365 150h72m-72 32h72m-72 32h48" />
          <path d="M478 180h58m-18-18 18 18-18 18" />
          <rect height="104" rx="16" width="70" x="536" y="128" />
          <circle className="is-solid" cx="571" cy="154" r="8" />
          <path className="secondary-line" d="M553 184h36m-36 22h36" />
        </>
      );
    case 'cookies-state-jar':
      return (
        <>
          <rect height="174" rx="22" width="232" x="62" y="86" />
          <path className="secondary-line" d="M62 128h232M92 108h16m14 0h16" />
          <path d="M178 170c-18-18-50-8-50 20 0 34 34 52 50 62 16-10 50-28 50-62 0-28-32-38-50-20z" />
          <path d="M310 180h66m-20-20 20 20-20 20" />
          <rect className="is-solid tone-one" height="116" rx="24" width="158" x="396" y="122" />
          <circle cx="440" cy="166" r="15" /><circle cx="504" cy="194" r="15" />
          <path className="secondary-line" d="M440 136v-24m64 52v-52M424 264h146" />
        </>
      );
    case 'encryption-eavesdropper':
      return (
        <>
          <circle cx="92" cy="180" r="34" /><circle cx="548" cy="116" r="34" /><circle cx="548" cy="244" r="34" />
          <path d="M126 180h112m164 0 112-54m-112 54 112 54" />
          <rect className="is-solid tone-three" height="96" rx="18" width="132" x="254" y="132" />
          <path d="M286 132v-20c0-42 68-42 68 0v20M320 164v30" />
          <circle cx="320" cy="160" r="8" />
          <path className="secondary-line" d="M78 180h28m428-64h28m-28 128h28" />
        </>
      );
    case 'interrupt-service-routine':
      return (
        <>
          <path d="M68 116h360M68 180h220M68 244h360" />
          {[108, 180, 252, 324, 396].map((x) => <circle className={x === 252 ? 'is-solid' : ''} cx={x} cy="116" key={x} r="14" />)}
          <path className="tone-four" d="M252 130v74c0 42 38 62 82 62h120" />
          <path d="M430 244h84m-20-20 20 20-20 20M514 116h-58c-44 0-82 20-82 62v24" />
          <rect height="70" rx="16" width="120" x="454" y="80" />
          <path className="secondary-line" d="M480 104h68m-68 22h44" />
        </>
      );
    case 'normalization-workbench':
      return (
        <>
          <rect height="174" rx="14" width="218" x="54" y="90" />
          <path className="thin-lines" d="M54 134h218M54 178h218M54 222h218M126 90v174" />
          <path d="M292 178h56m-18-18 18 18-18 18" />
          <rect className="is-solid tone-two" height="92" rx="14" width="108" x="372" y="80" />
          <rect height="92" rx="14" width="108" x="478" y="188" />
          <path d="M426 172v34h52m-82-94h60m46 108h60" />
          <circle className="is-solid" cx="478" cy="206" r="8" />
        </>
      );
    case 'file-access-hash':
      return (
        <>
          <rect height="58" rx="12" width="106" x="58" y="151" />
          <path d="M164 180h80m-20-20 20 20-20 20" />
          <circle className="is-solid tone-one" cx="304" cy="180" r="48" />
          <path d="M286 162h36m-36 36h36" />
          <path d="M352 180h72m-20-20 20 20-20 20" />
          {[94, 142, 190, 238].map((y, index) => <rect className={index === 2 ? 'is-solid' : ''} height="38" key={y} rx="8" width="130" x="448" y={y} />)}
          <path className="secondary-line" d="M514 228c52 0 66 34 38 58h-82" />
        </>
      );
    case 'graph-search-frontier':
      return (
        <>
          <path className="secondary-line" d="M92 180 218 92l120 88 120-92 90 92M92 180l126 92 120-92 120 88 90-88" />
          <path className="tone-three" d="M92 180 218 92l120 88 120-92 90 92" strokeWidth="8" />
          {[[92,180],[218,92],[218,272],[338,180],[458,88],[458,268],[548,180]].map(([x,y], index) => <circle className={index === 3 ? 'is-solid' : ''} cx={x} cy={y} key={`${x}-${y}`} r="20" />)}
          <path d="M520 150l28 30-28 30" />
        </>
      );
    case 'expert-system-inference-trace':
      return (
        <>
          <rect height="56" rx="12" width="150" x="54" y="96" /><rect height="56" rx="12" width="150" x="54" y="208" />
          <path d="M204 124h68m-20-20 20 20-20 20M204 236h68m-20-20 20 20-20 20" />
          <rect className="is-solid tone-two" height="150" rx="20" width="154" x="286" y="105" />
          <path d="M316 142h94m-94 38h70m-70 38h94" />
          <path d="M440 180h62m-20-20 20 20-20 20" />
          <circle cx="550" cy="180" r="38" /><path className="is-solid" d="m532 180 12 12 26-30" />
        </>
      );
    case 'logic-circuit-builder':
      return (
        <>
          <circle cx="70" cy="126" r="13" /><circle className="is-solid" cx="70" cy="234" r="13" />
          <path d="M83 126h90m-90 108h90M173 100h68c48 0 78 32 78 80s-30 80-78 80h-68z" />
          <path d="M319 180h76m-20-20 20 20-20 20" />
          <path className="tone-four" d="M395 116h72c46 0 74 25 74 64s-28 64-74 64h-72z" />
          <circle className="is-solid" cx="558" cy="180" r="13" />
          <path className="secondary-line" d="M445 116V78m0 166v38" />
        </>
      );
    case 'automation-chain-builder':
      return (
        <>
          <circle cx="86" cy="180" r="38" /><path d="M86 142v76m-19-20h38" />
          <path d="M124 180h88m-20-20 20 20-20 20" />
          <rect className="is-solid tone-one" height="112" rx="20" width="144" x="228" y="124" />
          <path d="M262 156h76m-76 32h52m-52 32h76M372 180h84m-20-20 20 20-20 20" />
          <path d="M486 232c-34-34 26-42-2-78 44 18 30-36 54-54 36 54 58 96 16 132-20 18-48 18-68 0z" />
        </>
      );
    case 'state-transition-tracer':
      return (
        <>
          <circle className="is-solid tone-two" cx="164" cy="180" r="70" /><circle cx="476" cy="180" r="70" />
          <path d="M234 150c72-62 170-62 242 0m0 0-32-2m32 2-12-30M406 210c-72 62-170 62-242 0m0 0 32 2m-32-2 12 30" />
          <path className="secondary-line" d="M134 180h60m-30-30v60M446 180h60" />
          <circle className="is-solid" cx="320" cy="104" r="10" /><circle cx="320" cy="256" r="10" />
        </>
      );
    case 'blockchain-tamper-evidence':
      return (
        <>
          {[52, 226, 400].map((x, index) => <rect className={index === 1 ? 'is-solid tone-three' : ''} height="132" key={x} rx="18" width="138" x={x} y="114" />)}
          <path className="secondary-line" d="M76 150h90m-90 34h70m-70 34h90M250 150h90m-90 34h70m-70 34h90M424 150h90m-90 34h70m-70 34h90" />
          <path d="M190 180h36m174 0h36" />
          <path className="tone-four" d="m372 148 12 25 28-8-15 25 24 15-29 4 3 29-23-19-22 19 3-29-29-4 24-15-15-25 28 8z" />
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
