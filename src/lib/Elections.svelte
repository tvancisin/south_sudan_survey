<script>
    import * as d3 from "d3";
    export let elections, colorScale, indy_locs;

    const lineHeight = 70;

    // Reactive scale for icon size
    let sizeScale = d3.scaleLinear().domain([1, 3]).range([8, 20]);

    // Adjusted getCircleY
    function getCircleY(score) {
        return lineHeight - ((score - 1) / 2) * lineHeight;
    }
</script>

<!-- ask how they gathered the data, how did they travel, ask more details about how they collected the data and why -->

{#each indy_locs as d}
    <g
        transform={`translate(${
            d[1][0].x -
            2.5 +
            (d[0] === "Yirol East"
                ? 40
                : ["Gogrial West", "Bor South"].includes(d[0])
                  ? 20
                  : 0)
        }, ${
            d[1][0].y +
            (["Yirol East", "Gogrial West"].includes(d[0]) ? 0 : 10) +
            (["Wau", "Juba", "Renk"].includes(d[0]) ? 30 : 0)
        })`}
    >
        <!-- Background rect centered on 0,0 -->
        <rect
            x={-(d[0].length * 3 + 4)}
            y="-7"
            width={d[0].length * 6 + 8}
            height="12"
            fill="white"
            rx="2"
            opacity="0.8"
        />

        <!-- Text centered on the same 0,0 -->
        <text
            text-anchor="middle"
            dominant-baseline="middle"
            font-size="10"
            font-weight="600"
            font-family="Montserrat"
            fill={d.env == "IDP Camp" ? "black" : "black"}
        >
            {d[0]}
        </text>
        /></g
    >
{/each}
{#each elections as d}
    {#if d.x && d.y && d.meanScore != null}
        <g
            transform={`translate(
    ${
        d.x +
        (d.adm2 === "Yirol East"
            ? 40
            : ["Gogrial West", "Bor South"].includes(d.adm2)
              ? 20
              : 0)
    },
    ${
        d.y -
        lineHeight +
        (["Yirol East", "Gogrial West"].includes(d.adm2) ? -10 : 0) +
        (["Wau", "Juba", "Renk"].includes(d.adm2) ? 30 : 0)
    }
  )`}
        >
            <!-- <rect
                x="-5.5"
                y="-7"
                width="7"
                height="7"
                fill={colorScale(d.poc)}
                opacity="1"
                stroke="black"
                stroke-width="0.5"
            /> -->

            <rect
                x="-6.5"
                y="0"
                width="9"
                height={lineHeight}
                fill="#cccccc"
                opacity="1"
            />
            <!-- Filled portion -->
            <rect
                x="-5"
                y={getCircleY(d.meanScore)}
                width="6"
                height={lineHeight - getCircleY(d.meanScore)}
                fill={colorScale(d.poc)}
                fill-opacity="1"
            />

            <!-- <image
                href={d.poc === "POC"
                    ? "./el_white.svg"
                    : d.poc === "IDP"
                      ? "./el_gray.svg"
                      : "./el_black.svg"}
                x={-sizeScale(d.meanScore) / 2 -1}
                y={getCircleY(d.meanScore) - sizeScale(d.meanScore)}
                width={sizeScale(d.meanScore)}
                height={sizeScale(d.meanScore)}
            >
                <title>Score: {d.meanScore.toFixed(2)}</title>
            </image> -->

            <line
                x1="-10"
                y1={lineHeight}
                x2="10"
                y2={lineHeight}
                stroke="gray"
                stroke-width="1"
            />
        </g>
    {/if}
{/each}
