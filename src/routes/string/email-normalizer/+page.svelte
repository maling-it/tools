<script>
    import ConvertPage from "../../../components/ConvertPage.svelte";
    import { normalizeEmails } from "#lib/utilities.js";

    let removeTags = $state(true);
    let gmailDots = $state(true);
    let dedupe = $state(true);
</script>

<ConvertPage
    title="Email Normalizer"
    description="Clean up a list of email addresses. Names and domains are lowercased, and you can remove +tags, remove the dots in Gmail names (googlemail.com becomes gmail.com) and drop duplicates. Separate addresses with new lines, commas or semicolons. Invalid entries are kept as comment lines."
    label="Email addresses"
    placeholder={"John.Doe+news@Gmail.com\njohndoe@googlemail.com, Ann@Example.COM"}
    rows={8}
    convert={(text) => normalizeEmails(text, { removeTags, gmailDots, dedupe })}
    outputTitle="Normalized"
    filename="emails.txt"
>
    {#snippet extra()}
        <div class="mb-3 d-flex flex-wrap gap-4">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="email-tags" bind:checked={removeTags} />
                <label class="form-check-label" for="email-tags">Remove +tags</label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="email-dots" bind:checked={gmailDots} />
                <label class="form-check-label" for="email-dots">Remove Gmail dots</label>
            </div>
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="email-dedupe" bind:checked={dedupe} />
                <label class="form-check-label" for="email-dedupe">Drop duplicates</label>
            </div>
        </div>
    {/snippet}
</ConvertPage>
