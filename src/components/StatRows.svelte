<script>
    // rows: [label, value] pairs
    let { rows = [], title = "Results" } = $props();
</script>

<div class="card p-3">
    <h2 class="h5 card-title">{title}</h2>
    <table class="table table-sm mb-0">
        <tbody>
            {#each rows as [name, value] (name)}
                <tr>
                    <th scope="row" class="fw-normal">{name}</th>
                    <td class="text-end fw-semibold">{value}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>
