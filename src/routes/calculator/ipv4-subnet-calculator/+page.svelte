<script>
    import StatRows from "../../../components/StatRows.svelte";
    import { subnet } from "#lib/netSecurity.js";

    let input = $state("192.168.1.130/26");

    const result = $derived.by(() => {
        try {
            const s = subnet(input);
            return {
                rows: [["CIDR", s.cidr], ["Netmask", s.netmask], ["Wildcard mask", s.wildcard], ["Network address", s.network], ["Broadcast address", s.broadcast], ["First host", s.firstHost], ["Last host", s.lastHost], ["Total addresses", s.totalAddresses.toLocaleString()], ["Usable hosts", s.usableHosts.toLocaleString()]],
                error: ""
            };
        } catch (e) {
            return { rows: [], error: e.message };
        }
    });
</script>

<svelte:head>
    <title>IPv4 Subnet Calculator | Mools</title>
</svelte:head>

<h1>IPv4 Subnet Calculator</h1>
<p class="text-body-secondary mb-3">Enter an IPv4 address with a prefix length (CIDR) to get the network details.</p>

<div class="row g-3">
    <div class="col-lg-5">
        <div class="card p-3">
            <label for="cidr" class="form-label">IP address / prefix</label>
            <input id="cidr" class="form-control font-monospace" placeholder="192.168.1.0/24" bind:value={input} spellcheck="false" />
        </div>
    </div>
    <div class="col-lg-7">
        {#if result.error}
            <div class="alert alert-danger" role="alert">{result.error}</div>
        {:else}
            <StatRows title="Subnet" copyable rows={result.rows} />
        {/if}
    </div>
</div>
