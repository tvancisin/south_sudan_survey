<script>
    export let aggregatedLocations;
    let list_width;
    
    // Order for POC types
    const pocOrder = ["POC", "IDP", "Other"];

    // Group locations by ADM2 and sort within groups
    $: groupedLocations = aggregatedLocations ? 
        Object.entries(
            aggregatedLocations.reduce((acc, loc) => {
                if (!acc[loc.adm2]) acc[loc.adm2] = [];
                acc[loc.adm2].push(loc);
                return acc;
            }, {})
        )
        .sort((a, b) => a[0].localeCompare(b[0])) // Sort districts alphabetically
        .map(([adm2, locs]) => [
            adm2,
            locs.sort((a, b) => 
                pocOrder.indexOf(a.poc) - pocOrder.indexOf(b.poc)
            )
        ]) : [];
</script>

<div class="list" bind:clientWidth={list_width}>
    <h1>Locations</h1>
    {#if groupedLocations}
        {#each groupedLocations as [adm2, locations]}
            <div class="location-group">
                <h3 class="district-name">{adm2}</h3>
                {#each locations as location}
                    <div class="list-item">
                        <span class="env-label">{location.poc}</span>
                        <div class="score-indicator">
                    <svg width={list_width - 40} height="55">
                        <line
                            x1="20"
                            y1="25"
                            x2={list_width - 60}
                            y2="25"
                            stroke="#ccc"
                            stroke-width="1"
                        />
                        <line
                            x1="20"
                            y1="22"
                            x2="20"
                            y2="28"
                            stroke="#666"
                            stroke-width="1"
                        />
                        <line
                            x1={list_width - 60}
                            y1="22"
                            x2={list_width - 60}
                            y2="28"
                            stroke="#666"
                            stroke-width="1"
                        />
                        <text
                            x="20"
                            y="38"
                            text-anchor="middle"
                            font-size="10"
                            font-family="Montserrat">1</text
                        >
                        <text
                            x="20"
                            y="50"
                            text-anchor="middle"
                            font-size="10"
                            font-weight="500"
                            font-family="Montserrat"
                            fill="#666">unsafe</text
                        >
                        <text
                            x={list_width - 60}
                            y="38"
                            text-anchor="middle"
                            font-size="10"
                            font-family="Montserrat">5</text
                        >
                        <text
                            x={list_width - 60}
                            y="50"
                            text-anchor="middle"
                            font-size="10"
                            font-weight="500"
                            font-family="Montserrat"
                            fill="#666">safe</text
                        >
                        <!-- Score indicator -->
                        {#if location.meanScore}
                            <text
                                x={20 +
                                    ((list_width - 80) *
                                        (location.meanScore - 1)) /
                                        4}
                                y="15"
                                text-anchor="middle"
                                font-size="12"
                                font-family="Montserrat"
                                fill="#666"
                            >{location.meanScore?.toFixed(2)}</text>
                            <circle
                                cx={20 +
                                    ((list_width - 80) *
                                        (location.meanScore - 1)) /
                                        4}
                                cy="25"
                                r="3.5"
                                fill="black"
                            />
                        {/if}
                    </svg>
                        </div>
                    </div>
                {/each}
            </div>
        {/each}
    {/if}
</div>

<style>
    h1 {
        font-family: Montserrat;
        font-size: 1.5em;
        font-weight: 600;
        margin-bottom: 5px;
        margin-top: 0px;
        padding-bottom: 5px;
        text-align: center;
    }
    .list {
        position: absolute;
        right: 0px;
        width: 30%;
        height: 100vh;
        background-color: white;
        box-shadow: -2px 0 5px rgba(0, 0, 0, 0.1);
        overflow-y: auto;
        padding: 10px;
        box-sizing: border-box;
    }
    .list::after {
        content: "";
        display: block;
        height: 10px; /* Extra space at the bottom */
    }
    .location-group {
        margin-bottom: 20px;
        border-bottom: 2px solid #ddd;
        padding-bottom: 10px;
    }
    .district-name {
        margin: 0 0 10px 0;
        padding: 5px 10px;
        font-family: Montserrat;
        font-size: 1.1em;
        font-weight: 600;
        background-color: #f5f5f5;
    }
    .list-item {
        padding: 8px 10px;
        margin-bottom: 8px;
        background-color: white;
    }
    .env-label {
        font-size: 0.9em;
        color: #666;
        font-weight: 400;
        font-family: Montserrat;
    }
    .score-indicator {
        display: flex;
        align-items: center;
    }

</style>
