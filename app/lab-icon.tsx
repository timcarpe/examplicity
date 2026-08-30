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
              const isAccent = row === 2 && column === 0;
              return (
                <g key={`${row}-${column}`}>
                  <rect className={isAccent ? 'is-solid tone-one' : undefined} height="42" rx="8" width="46" x={122 + column * 50} y={y} />
                  <text fill={isAccent ? 'var(--paper)' : 'currentColor'} fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace" fontSize="22" fontWeight="800" stroke="none" textAnchor="middle" x={145 + column * 50} y={y + 29}>{bit}</text>
                </g>
              );
            }))}
          </g>
          <path d="M82 153h24m-12-12v24M104 194h432" />
        </>
      );
    case 'binary-floating-point':
      return (
        <>
          <g className="thin-lines">
            {[0, 1, 2, 3, 4].map((cell) => (
              <rect className={cell === 0 ? 'is-solid' : ''} height="46" key={`m-${cell}`} rx="7" width="48" x={54 + cell * 52} y="82" />
            ))}
            {[0, 1, 2].map((cell) => (
              <rect className={cell === 2 ? 'is-solid tone-three' : ''} height="46" key={`e-${cell}`} rx="7" width="48" x={326 + cell * 52} y="82" />
            ))}
          </g>
          <path d="M314 50v20m-10-10 10 10 10-10" />
          <path className="secondary-line" d="M64 238h39m14 0h22m14 0h22m14 0h22m14 0h22m14 0h39M340 238h23m18 0h70m18 0h70m18 0h19" />
          {[110, 146, 182, 218, 254].map((x) => <circle className="is-solid" cx={x} cy="238" key={x} r="7" />)}
          {[372, 460, 548].map((x, index) => <circle className={index === 1 ? 'is-solid' : ''} cx={x} cy="238" key={x} r="9" />)}
          <path d="M84 282h196m-14-10 14 10-14 10M556 282H360m14-10-14 10 14 10" />
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
          <path d="M292 170h74m-22-22 22 22-22 22" />
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
          <path className="is-solid tone-one" d="m322 28 8 18 20-6-11 18 17 10-20 4 2 21-16-14-16 14 2-21-20-4 17-10-11-18 20 6z" />
          <path d="M542 202v34c0 42-30 62-76 62H134c-46 0-68-20-68-58m0 0 22 24m-22-24-22 24" />
        </>
      );
    case 'data-transmission-methods':
      return (
        <>
          <rect height="112" rx="18" width="112" x="48" y="124" />
          <rect height="112" rx="18" width="112" x="480" y="124" />
          <g className="thin-lines">
            {[0, 1, 2, 3].map((line) => (
              <path d={`M160 ${145 + line * 23}H270M366 ${145 + line * 23}H480`} key={line} />
            ))}
          </g>
          <path className="is-solid tone-three" d="m320 140 10 28 29-8-18 24 24 17-30 1-2 30-19-23-23 19 7-29-28-7 26-14-14-27 27 13z" />
          <path d="M72 180h64m368 0h64" />
        </>
      );
    case 'network-topology':
      return (
        <>
          <path className="secondary-line" d="M156 108 274 161M156 252l118-53" />
          <path d="M366 180h48m24 0h46" />
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
          <path d="M58 190h218m88 0h218M110 190v-66M320 150v-26M530 190v-66" />
          {[110, 320, 530].map((x) => (
            <g key={x}>
              <rect height="48" rx="10" width="82" x={x - 41} y="72" />
              <path d={`M${x} 120v4m-24 0h48`} />
            </g>
          ))}
          <path d="M88 190h162m-22-20 22 20-22 20M552 190H390m22-20-22 20 22 20" />
          <path className="is-solid tone-three" d="m320 150 10 24 26-8-14 24 22 14-26 4 2 27-20-18-20 18 2-27-26-4 22-14-14-24 26 8z" />
          <path className="secondary-line" d="M264 264c-54 38-118 38-172 0m0 0 24 4m-24-4 8 23M376 264c54 38 118 38 172 0m0 0-24 4m24-4-8 23" />
          <circle cx="150" cy="278" r="7" />
          <circle cx="476" cy="278" r="7" />
          <circle cx="500" cy="278" r="7" />
        </>
      );
    case 'packet-switching':
      return (
        <>
          {[0, 1, 2, 3].map((packet) => (
            <rect className={packet === 1 ? 'is-solid tone-one' : ''} height="40" key={packet} rx="8" width="54" x={54} y={82 + packet * 48} />
          ))}
          <circle cx="278" cy="98" r="28" />
          <circle cx="278" cy="260" r="28" />
          <circle className="is-solid" cx="410" cy="180" r="32" />
          <path d="M108 102 250 98M108 150l143-44M108 198l144 52M108 246l142 12M302 113l81 50m-81 82 81-48" />
          <path className="secondary-line" d="M442 180h48m-14-14 14 14-14 14" />
          {[0, 1, 2, 3].map((packet) => <rect height="40" key={`r-${packet}`} rx="8" width="18" x={502 + packet * 20} y="160" />)}
        </>
      );
    case 'ipv4-subnetting':
      return (
        <>
          <rect className="tone-one" height="214" rx="24" width="214" x="54" y="72" />
          <rect height="214" rx="24" width="214" x="372" y="72" />
          {[{ x: 105, y: 126 }, { x: 208, y: 126 }, { x: 105, y: 232 }, { x: 208, y: 232 }, { x: 423, y: 126 }, { x: 526, y: 126 }, { x: 423, y: 232 }, { x: 526, y: 232 }].map(({ x, y }) => <circle cx={x} cy={y} key={`${x}-${y}`} r="14" />)}
          <rect className="is-solid" height="74" rx="14" width="74" x="283" y="143" />
          <path d="M268 180h15m74 0h15M320 116v27m0 74v27" />
        </>
      );
    case 'encryption-in-data-transmission':
      return (
        <>
          <rect height="92" rx="16" width="122" x="54" y="98" />
          <rect height="92" rx="16" width="122" x="464" y="98" />
          <path d="M176 144h38M246 144h12M290 144h12M334 144h12M378 144h12M422 144h42M320 144v82" />
          {[214, 258, 302, 346, 390].map((x, index) => (
            <rect className={index > 1 ? 'is-solid' : undefined} height="32" key={x} rx="7" width="32" x={x} y="128" />
          ))}
          <path className="secondary-line" d="M264 104h112l-18-24h-76z" />
          <path className="is-solid tone-three" fillRule="evenodd" d="M294 238a24 24 0 1 0 0 48 24 24 0 0 0 22-15h22v13h12v-13h14v17h12v-17h12v-12h-72a24 24 0 0 0-22-21zm0 12a12 12 0 1 1 0 24 12 12 0 0 1 0-24z" />
        </>
      );
    case 'dns-web-page-retrieval':
      return (
        <>
          <rect height="188" rx="18" width="214" x="48" y="82" />
          <path className="secondary-line" d="M48 124h214M78 104h118" />
          <rect className="is-solid tone-two" height="54" rx="9" width="150" x="80" y="158" />
          <path d="M274 122h64m-20-18 20 18-20 18" />
          <path d="M338 238h-64m20-18-20 18 20 18" />
          <g className="thin-lines">
            <rect height="76" rx="12" width="104" x="354" y="84" />
            <rect height="76" rx="12" width="104" x="354" y="200" />
          </g>
          <path d="M458 122h74v116h-74" />
          <circle className="is-solid" cx="406" cy="122" r="10" />
          <circle className="is-solid" cx="406" cy="238" r="10" />
        </>
      );
    case 'tcp-ip-encapsulation':
      return (
        <>
          <rect height="194" rx="24" width="242" x="72" y="82" />
          <rect height="154" rx="20" width="202" x="92" y="102" />
          <rect height="112" rx="16" width="160" x="113" y="123" />
          <rect className="is-solid tone-three" height="68" rx="12" width="116" x="135" y="145" />
          <path d="M337 180h78m-22-22 22 22-22 22" />
          <g className="thin-lines">
            <rect height="42" rx="9" width="122" x="438" y="92" />
            <rect height="42" rx="9" width="122" x="438" y="144" />
            <rect height="42" rx="9" width="122" x="438" y="196" />
            <rect height="42" rx="9" width="122" x="438" y="248" />
          </g>
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
          <path d="M306 167h70m-20-20 20 20-20 20" />
          <rect height="178" rx="28" width="154" x="410" y="80" />
          <path d="M448 128h78m-78 44h78m-78 44h48" />
          <circle className="is-solid" cx="524" cy="216" r="12" />
        </>
      );
    case 'software-stack':
      return (
        <>
          <path className="secondary-line" d="M320 54v30m-18-18 18 18 18-18" />
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
          <path d="M250 270c38 42 102 42 140 0m0 0-24 6m24-6-8 24" />
          <path className="secondary-line" d="M400 78h112" />
          <circle cx="422" cy="78" r="9" />
          <circle className="is-solid" cx="458" cy="78" r="9" />
          <circle cx="494" cy="78" r="9" />
        </>
      );
    case 'process-states-scheduling':
      return (
        <>
          <rect height="190" rx="18" width="154" x="52" y="84" />
          <rect height="190" rx="18" width="154" x="244" y="84" />
          <rect height="190" rx="18" width="154" x="436" y="84" />
          <path d="M214 152h22m-10-10 10 10-10 10M406 208h22m-10-10 10 10-10 10" />
          <rect className="is-solid" height="34" rx="8" width="104" x="76" y="118" />
          <rect height="34" rx="8" width="104" x="76" y="168" />
          <rect className="is-solid tone-one" height="72" rx="12" width="104" x="269" y="138" />
          <rect height="34" rx="8" width="104" x="462" y="118" />
          <path className="secondary-line" d="M488 184h52m-52 24h52m-52 24h34" />
        </>
      );
    case 'automated-system-control-flowcharts':
      return (
        <>
          <rect height="62" rx="14" width="116" x="48" y="149" />
          <path className="secondary-line" d="M76 180h60m-30-30v60" />
          <path d="M176 180h54m-18-16 18 16-18 16" />
          <rect className="is-solid tone-one" height="82" rx="16" width="136" x="242" y="139" />
          <path d="M390 180h36m-16-16 16 16-16 16" />
          <path d="m500 126 62 54-62 54-62-54z" />
          <path d="M574 180h12m-8-8 8 8-8 8M500 234v48H106v-59m-12 12 12-12 12 12" />
          <circle className="is-solid" cx="604" cy="180" r="10" />
        </>
      );
    case 'combinational-logic-circuit-design':
      return (
        <>
          <circle cx="92" cy="122" r="20" />
          <circle cx="92" cy="238" r="20" />
          <path d="M112 122h118l34 38M112 238h118l34-38" />
          <path className="is-solid tone-one" d="M264 102h68c54 0 88 32 88 78s-34 78-88 78h-68z" />
          <path d="M420 180h92" />
          <circle cx="538" cy="180" r="26" />
        </>
      );
    case 'dijkstra-a-star-graph-search':
      return (
        <>
          <path className="secondary-line" d="M102 166 198 104M102 194l96 62M244 92l132 8M244 268l132-8M238 112l144 128M424 112l114 54M424 248l114-54" />
          <path d="M102 194l96 62M244 268l132-8M424 248l114-54" />
          <circle cx="78" cy="180" r="26" />
          <circle cx="220" cy="90" r="24" />
          <circle cx="220" cy="270" r="24" />
          <circle className="is-solid tone-one" cx="400" cy="100" r="24" />
          <circle cx="400" cy="260" r="24" />
          <circle cx="562" cy="180" r="26" />
        </>
      );
    case 'prime-factors-hcf-lcm':
      return (
        <>
          <rect height="96" rx="48" width="328" x="68" y="94" />
          <rect height="96" rx="48" width="328" x="244" y="170" />
          <circle cx="148" cy="142" r="22" />
          <circle cx="212" cy="142" r="22" />
          <circle className="is-solid tone-one" cx="320" cy="180" r="28" />
          <circle cx="428" cy="218" r="22" />
          <circle cx="492" cy="218" r="22" />
        </>
      );
    case 'database-normalisation':
      return (
        <>
          <rect height="190" rx="20" width="218" x="54" y="84" />
          <path className="thin-lines" d="M54 136h218M54 188h218M126 84v190M198 84v190" />
          <path d="M292 180h46M338 180l34-62M338 180l34 62" />
          <rect className="is-solid tone-one" height="96" rx="18" width="188" x="390" y="66" />
          <rect height="96" rx="18" width="188" x="390" y="198" />
          <path className="thin-lines" d="M390 114h188M452 66v96M390 246h188M452 198v96" />
        </>
      );
    case 'ratio-concentration-flow-rate':
      return (
        <>
          <path d="M194 72v184c0 52 42 94 94 94h64c52 0 94-42 94-94V72" />
          <path className="secondary-line" d="M214 156h212" />
          <path className="is-solid tone-one" d="M214 218h212v38c0 41-33 74-74 74h-64c-41 0-74-33-74-74z" />
        </>
      );
    case 'recurring-decimals-fractions':
      return (
        <>
          <path d="M82 212c38-82 84-82 122 0s84 82 122 0 84-82 122 0 84 82 122 0" />
          <circle cx="82" cy="212" r="18" />
          <circle cx="326" cy="212" r="18" />
          <circle className="is-solid tone-one" cx="570" cy="212" r="22" />
          <path className="secondary-line" d="M82 118h488" />
        </>
      );
    case 'rounded-measurements-bounds':
      return (
        <>
          <path d="M118 180h404M118 128v104M522 128v104" />
          <circle className="is-solid tone-one" cx="320" cy="180" r="30" />
        </>
      );
    case 'repeated-percentage-change':
      return (
        <>
          <rect className="is-solid tone-one" height="96" rx="20" width="144" x="248" y="132" />
          <rect height="160" rx="24" width="240" x="200" y="100" />
          <rect height="232" rx="30" width="348" x="146" y="64" />
        </>
      );
    case 'set-membership-operations':
      return (
        <>
          <circle cx="254" cy="180" r="112" />
          <circle cx="386" cy="180" r="112" />
          <path className="is-solid tone-one" d="M320 89a112 112 0 0 1 0 182 112 112 0 0 1 0-182z" />
        </>
      );
    case 'time-zone-timetable-constraints':
      return (
        <>
          <circle cx="170" cy="180" r="82" />
          <circle cx="320" cy="180" r="82" />
          <circle cx="470" cy="180" r="82" />
          <path className="secondary-line" d="M170 180v-44m0 44 34 22M470 180v-44m0 44-34 22" />
          <path className="is-solid tone-one" d="M320 180v-54m0 54 42-28" />
        </>
      );
    case 'sequence-patterns-differences':
      return (
        <>
          <rect height="72" rx="16" width="96" x="94" y="214" />
          <rect height="128" rx="16" width="96" x="272" y="158" />
          <rect className="is-solid tone-one" height="200" rx="16" width="96" x="450" y="86" />
        </>
      );
    case 'motion-graph-rate-area':
      return (
        <>
          <path d="M92 74v218h470" />
          <path className="is-solid tone-one" d="M132 260 270 116l154 78 92-86v152z" />
          <path d="M132 260 270 116l154 78 92-86" />
        </>
      );
    case 'straight-line-coordinates-equations':
      return (
        <>
          <path className="tone-one" d="M96 260 516 88" />
          <path d="M124 304 544 132" />
        </>
      );
    case 'coordinate-distance-midpoint-perpendicular':
      return (
        <>
          <path d="M116 244 293 188.5M347 171.5 524 116M256 68 306 156M334 204 384 292" />
          <circle className="is-solid tone-one" cx="320" cy="180" r="28" />
        </>
      );
    case 'circle-theorem-constraint-network':
      return (
        <>
          <circle cx="320" cy="180" r="118" />
          <path d="M222 246 418 246M236 106 410 232M202 62v236" />
          <path className="tone-one" d="M202 114a48 48 0 0 1 38 20" />
        </>
      );
    case 'solid-surface-volume-tradeoffs':
      return (
        <>
          <path d="m160 116 226-42 94 66-226 42zm0 0v146l94 58V182m226-42v146l-226 34" />
          <path className="is-solid tone-one" d="m160 116 94 66v138l-94-58z" />
        </>
      );
    case 'right-triangle-ratio-invariance':
      return (
        <>
          <path d="M122 286h396L122 80z" />
          <path d="M122 252h34v34" />
          <path className="tone-one" d="M454 286a64 64 0 0 0-8-31" />
        </>
      );
    case 'trigonometric-function-periodicity-solutions':
      return (
        <>
          <circle cx="174" cy="180" r="92" />
          <path className="secondary-line" d="M82 180h184M174 88v184M306 180h260" />
          <path className="tone-one" d="M306 180c42-112 86-112 130 0s86 112 130 0" />
        </>
      );
    case 'non-right-triangle-solution-constraints':
      return (
        <>
          <path d="M110 282 292 78l238 204zM110 282 390 136l140 146" />
          <path className="tone-one" d="M167 218a76 76 0 0 0 43 28" />
        </>
      );
    case 'python-programming-practice':
      return (
        <>
          <rect height="224" rx="22" width="284" x="62" y="68" />
          <path className="secondary-line" d="M96 112h118m-118 38h202m-202 38h162m-162 38h190" />
          <path d="m116 134-18 16 18 16m72-32 18 16-18 16" />
          <rect height="64" rx="14" width="174" x="402" y="78" />
          <rect className="is-solid tone-one" height="64" rx="14" width="174" x="402" y="158" />
          <rect height="48" rx="14" width="174" x="402" y="242" />
          <path d="m430 190 18 18 34-42M430 266h118" />
        </>
      );
    case 'translator':
      return (
        <>
          <rect height="190" rx="22" width="220" x="58" y="82" />
          <rect height="190" rx="22" width="220" x="362" y="82" />
          <path className="secondary-line" d="M92 122h88m-88 36h128m-128 36h106m-106 36h142M396 122h76m-76 36h142m-142 36h112m-112 36h136" />
          <path d="m126 142-24 20 24 20m64-40 24 20-24 20M428 142l-24 20 24 20m64-40 24 20-24 20" />
          <path className="is-solid tone-one" d="m290 180 16-16v8h28v-8l16 16-16 16v-8h-28v8z" />
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
