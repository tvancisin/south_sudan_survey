<script>
    export let polygon_data, geo_data, width, pathGenerator;
</script>

{#each polygon_data as feature}
    <!-- {#each geo_data as feature}
        <path
            d={pathGenerator(feature)}
            stroke="black"
            fill="black"
            opacity="0.5"
        />
    {/each} -->
    <!-- polygon -->
    <path
        d={pathGenerator(feature)}
        stroke={feature.properties.ADMIN === "South Sudan" ? "#b3b3b3" : "#b3b3b3"}
        fill={feature.properties.ADMIN === "South Sudan" ? "white" : "white"}
    />
    {#each geo_data as feature}
        <path
            d={pathGenerator(feature)}
            stroke="steelblue"
            stroke-width="3"
            fill="none"
            opacity="0.5"
        />
    {/each}

    <!-- label -->
    <!-- {#if feature.properties.ADMIN != "South Sudan"}
        <text
            x={pathGenerator.centroid(feature)[0]}
            y={pathGenerator.centroid(feature)[1]}
            text-anchor="middle"
            font-size="14"
            font-family="Montserrat"
            fill="black"
        >
            {feature.properties.ADMIN}
        </text>
    {/if} -->
{/each}
<g
    transform="translate({width - 140}, 70)"
    font-family="Montserrat"
    font-weight="500"
    font-size="12"
>
    <g>
        <rect
            x="100"
            y="0"
            width="25"
            height="20"
            fill="white"
            stroke="black"
            stroke-width="2"
            rx="3"
        />
        <text
            x="60"
            y="10"
            dominant-baseline="middle"
            font-weight="600"
            fill="black">POC</text
        >
    </g>

    <g transform="translate(0, 25)">
        <rect
            x="100"
            y="0"
            width="25"
            height="20"
            fill="gray"
            stroke="black"
            stroke-width="2"
            rx="3"
        />
        <text
            x="65"
            y="10"
            dominant-baseline="middle"
            font-weight="600"
            fill="black">IDP</text
        >
    </g>

    <g transform="translate(0, 50)">
        <rect
            x="100"
            y="0"
            width="25"
            height="20"
            fill="black"
            stroke="black"
            stroke-width="2"
            rx="3"
        />
        <text
            x="50"
            y="10"
            dominant-baseline="middle"
            fill="black"
            font-weight="600"
            font-family="Montserrat">Other</text
        >
    </g>
</g>
