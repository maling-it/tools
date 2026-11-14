<script>
    import { octalToPermissions, permissionsToOctal, permissionsToSymbolic } from "#lib/devUtils.js";
    import OutputCard from "../../../components/OutputCard.svelte";

    let permissions = $state(octalToPermissions("755"));
    let octalInput = $state("755");

    const octal = $derived(permissionsToOctal(permissions));
    const symbolic = $derived(permissionsToSymbolic(permissions));

    const groups = ["Owner", "Group", "Others"];
    const flags = [["r", "Read"], ["w", "Write"], ["x", "Execute"]];

    $effect(() => {
        octalInput = octal;
    });

    const onOctalInput = (event) => {
        octalInput = event.currentTarget.value;
        if (/^[0-7]{3}$/.test(octalInput)) permissions = octalToPermissions(octalInput);
    };
</script>

<svelte:head>
    <title>Chmod Calculator | Mools</title>
</svelte:head>

<h1>Chmod Calculator</h1>
<p class="text-body-secondary mb-3">Pick Unix file permissions and get the octal and symbolic notation and the chmod command.</p>

<div class="row g-3">
    <div class="col-lg-7">
        <div class="card p-3">
            <table class="table align-middle mb-3">
                <thead>
                    <tr><th></th>{#each flags as [, name] (name)}<th class="text-center">{name}</th>{/each}</tr>
                </thead>
                <tbody>
                    {#each groups as group, g (group)}
                        <tr>
                            <th scope="row" class="fw-normal">{group}</th>
                            {#each flags as [flag, name] (flag)}
                                <td class="text-center">
                                    <input class="form-check-input" type="checkbox" aria-label="{group} {name}" bind:checked={permissions[g][flag]} />
                                </td>
                            {/each}
                        </tr>
                    {/each}
                </tbody>
            </table>
            <div>
                <label for="octal" class="form-label">Octal</label>
                <input id="octal" class="form-control font-monospace w-auto" maxlength="3" value={octalInput} oninput={onOctalInput} />
            </div>
        </div>
    </div>
    <div class="col-lg-5 d-flex flex-column gap-3">
        <OutputCard title="Symbolic" text={`-${symbolic}`} />
        <OutputCard title="Command" text={`chmod ${octal} filename`} />
    </div>
</div>
