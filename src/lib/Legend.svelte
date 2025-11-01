<script>
    import * as d3 from "d3";
    export let heightScale,
        margin,
        height,
        width,
        current_mean,
        spike,
        bars,
        elections_check;

    const spikeLabels = [
        "Very Unsafe",
        "Neither Safe, Nor Unsafe",
        "Very Safe",
    ];
    $: bars_sample = [
        {
            adm2: "Malakal",
            poc: "Other",
            env: "Urban",
            x: 150,
            y: 20,
            filteredVisionCounts: [
                {
                    Party_Vision:
                        "Sudan People’s Liberation Movement In Government (SPLM-IG)",
                    count: 954,
                },
                {
                    Party_Vision:
                        "Sudan People’s Liberation Movement In Opposition (SPLM-IO)",
                    count: 344,
                },
            ],
        },
        {
            adm2: "Malakal",
            poc: "IDP",
            env: "IDP Camp",
            x: 143,
            y: 20,
            filteredVisionCounts: [
                {
                    Party_Vision:
                        "Sudan People’s Liberation Movement In Government (SPLM-IG)",
                    count: 428,
                },
                {
                    Party_Vision:
                        "Sudan People’s Liberation Movement In Opposition (SPLM-IO)",
                    count: 526,
                },
            ],
        },
    ];
    const scale = d3.scaleLinear().domain([0, 2000]).range([2, 50]); // bar width

    // Assign direction per POC type
    const direction = {
        IDP: -1,
        Other: 1,
    };
</script>

<div class="right_legend">
    <svg width="200" height="200">
        {#if bars}
            {#each bars_sample as d}
                {#each d.filteredVisionCounts as party, i}
                    <rect
                        x={d.x +
                            10 +
                            (direction[d.poc] === 1 ? -5 : -scale(party.count))}
                        y={d.y - i * 23 + 10}
                        width={scale(party.count)}
                        height={20}
                        fill={d.poc === "IDP" ? "gray" : "black"}
                    />
                {/each}
            {/each}

            <!-- IDP / Other bars -->
            <line
                x1="150"
                y1="60"
                x2="150"
                y2="70"
                stroke="black"
                stroke-dasharray="4 2"
                stroke-width="0.5"
            />
            <text
                x="150"
                y="85"
                font-size="12"
                font-family="Montserrat"
                font-weight="500"
                text-anchor="end">IDP</text
            >

            <line
                x1="170"
                y1="60"
                x2="170"
                y2="70"
                stroke="black"
                stroke-dasharray="4 2"
                stroke-width="0.5"
            />
            <text
                x="165"
                y="80"
                font-size="12"
                font-family="Montserrat"
                font-weight="500"
                alignment-baseline="middle"
                text-anchor="start">Other</text
            >

            <!-- Parties -->
            <text
                x="120"
                y="20"
                font-size="12"
                font-family="Montserrat"
                font-weight="500"
                alignment-baseline="middle"
                text-anchor="end">Opposition</text
            >
            <line
                x1="125"
                y1="20"
                x2="135"
                y2="20"
                stroke="black"
                stroke-dasharray="4 2"
                stroke-width="0.5"
            />

            <text
                x="120"
                y="40"
                font-size="12"
                font-family="Montserrat"
                font-weight="500"
                alignment-baseline="middle"
                text-anchor="end">Government</text
            >
            <line
                x1="125"
                y1="40"
                x2="135"
                y2="40"
                stroke="black"
                stroke-dasharray="4 2"
                stroke-width="0.5"
            />
        {:else}
            <!-- Compact default legend -->
            <rect
                x="170"
                y="20"
                width="6"
                height="60"
                fill="#a6a6a6"
                opacity="0.3"
            />
            <rect
                x="170"
                y="40"
                width="6"
                height="40"
                fill="black"
                opacity="0.7"
            />
            <circle cx="173" cy="35" r="5" fill="#808080" stroke="black" />
            <line
                x1="150"
                y1="20"
                x2="170"
                y2="20"
                stroke="black"
                stroke-dasharray="4 2"
                stroke-width="0.5"
            />

            {#if elections_check}
                <text
                    x="145"
                    y="20"
                    font-size="12"
                    font-family="Montserrat"
                    font-weight="500"
                    alignment-baseline="middle"
                    text-anchor="end">Soon</text
                >
                <text
                    x="145"
                    y="80"
                    font-size="12"
                    font-family="Montserrat"
                    font-weight="500"
                    alignment-baseline="middle"
                    text-anchor="end">Never</text
                >
            {:else if current_mean == "Sec_Gunshots_Now_N"}
                <text
                    x="145"
                    y="20"
                    font-size="12"
                    font-family="Montserrat"
                    font-weight="500"
                    alignment-baseline="middle"
                    text-anchor="end">Every Night</text
                >
                <text
                    x="145"
                    y="80"
                    font-size="12"
                    font-family="Montserrat"
                    font-weight="500"
                    alignment-baseline="middle"
                    text-anchor="end">Never</text
                >
            {:else}
                <text
                    x="145"
                    y="20"
                    font-size="12"
                    font-family="Montserrat"
                    font-weight="500"
                    alignment-baseline="middle"
                    text-anchor="end">Safe</text
                >
                <text
                    x="145"
                    y="80"
                    font-size="12"
                    font-family="Montserrat"
                    font-weight="500"
                    alignment-baseline="middle"
                    text-anchor="end">Unsafe</text
                >
            {/if}

            <line
                x1="150"
                y1="80"
                x2="170"
                y2="80"
                stroke="black"
                stroke-dasharray="4 2"
                stroke-width="0.5"
            />
        {/if}
    </svg>
</div>
<div class="left_legend">
    <svg width="200" height="200">
        <!-- White -->
        <!-- <rect
            x="30"
            y="30"
            rx="3"
            width="20"
            height="20"
            fill="white"
            stroke="black"
        />
        <line
            x1="55"
            y1="37.5"
            x2="65"
            y2="37.5"
            stroke="black"
            stroke-dasharray="4 2"
            stroke-width="0.5"
        />
        <text
            x="70"
            y="40"
            font-size="12"
            font-family="Montserrat"
            font-weight="500"
            alignment-baseline="middle"
            text-anchor="start">POC</text -->
        >

        <!-- Gray -->
        <rect
            x="30"
            y="30"
            rx="3"
            width="20"
            height="20"
            fill="gray"
            stroke="black"
        />
        <line
            x1="55"
            y1="37.5"
            x2="65"
            y2="37.5"
            stroke="black"
            stroke-dasharray="4 2"
            stroke-width="0.5"
        />
        <text
            x="70"
            y="40"
            font-size="12"
            font-family="Montserrat"
            font-weight="500"
            alignment-baseline="middle"
            text-anchor="start">IDP</text
        >

        <!-- Black -->
        <rect
            x="30"
            y="60"
            rx="3"
            width="20"
            height="20"
            fill="black"
            stroke="black"
        />
        <line
            x1="55"
            y1="67.5"
            x2="65"
            y2="67.5"
            stroke="black"
            stroke-dasharray="4 2"
            stroke-width="0.5"
        />
        <text
            x="70"
            y="70"
            font-size="12"
            font-family="Montserrat"
            font-weight="500"
            alignment-baseline="middle"
            text-anchor="start">Other</text
        >
    </svg>
</div>

<style>
    .right_legend {
        position: absolute;
        top: 120px;
        right: 5px;
        transform-origin: top right;
    }

    @media (max-width: 768px) {
        .right_legend {
            top: 50px;
            transform: scale(0.8);
        }
    }

    .left_legend {
        position: absolute;
        top: 140px;
        left: -5px;
    }

    @media (max-width: 768px) {
        .left_legend {
            top: 50px;
            transform: scale(0.8);
            transform-origin: top left;
        }
    }
</style>
