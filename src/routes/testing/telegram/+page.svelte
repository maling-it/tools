<script>
    import OutputCard from "../../../components/OutputCard.svelte";

    const methods = {
        sendMessage: { label: "Send Message", field: null },
        sendPhoto: { label: "Send Photo", field: "photo", accept: "image/*" },
        sendDocument: { label: "Send Document", field: "document", accept: "*" }
    };

    let botToken = $state("");
    let chatId = $state("");
    let text = $state("");
    let method = $state("sendMessage");
    let parseMode = $state("");
    let file = $state(null);
    let response = $state("");
    let error = $state("");
    let sending = $state(false);

    const fileField = $derived(methods[method].field);
    const textField = $derived(method === "sendMessage" ? "text" : "caption");
    const endpoint = $derived(`https://api.telegram.org/bot${botToken}/${method}`);

    const missing = $derived.by(() => {
        if (!botToken.trim()) return "Bot token is required.";
        if (!chatId.trim()) return "Chat ID is required.";
        if (method === "sendMessage" && !text.trim()) return "Message is required.";
        if (fileField && !file) return "Choose a file to upload.";
        return "";
    });

    // Single-quote a value for POSIX shells.
    const quote = (value) => `'${String(value).replace(/'/g, `'\\''`)}'`;

    const curl = $derived.by(() => {
        const fields = [["chat_id", chatId]];
        if (text) fields.push([textField, text]);
        if (parseMode) fields.push(["parse_mode", parseMode]);
        const args = fields.map(([key, value]) => `-F ${quote(`${key}=${value}`)}`);
        if (fileField) args.push(`-F ${quote(`${fileField}=@${file?.name ?? "file"}`)}`);
        return `curl -X POST ${args.join(" ")} ${quote(endpoint)}`;
    });

    const send = async () => {
        error = "";
        response = "";
        if (missing) {
            error = missing;
            return;
        }

        const body = new FormData();
        body.append("chat_id", chatId.trim());
        if (text) body.append(textField, text);
        if (parseMode) body.append("parse_mode", parseMode);
        if (fileField) body.append(fileField, file);

        sending = true;
        try {
            const result = await fetch(`https://api.telegram.org/bot${botToken.trim()}/${method}`, {
                method: "POST",
                body
            });
            response = JSON.stringify(await result.json(), null, 2);
        } catch (e) {
            error = `Request failed: ${e.message}`;
        } finally {
            sending = false;
        }
    };
</script>

<svelte:head>
    <title>Telegram Bot Testing | Mools</title>
</svelte:head>

<h1>Telegram Bot Testing</h1>
<p class="text-body-secondary mb-3">
    Requests go straight from your browser to api.telegram.org. Your bot token is never stored or sent anywhere else.
</p>

<div class="row g-3">
    <div class="col-lg-6">
        <form class="card p-3" onsubmit={(e) => { e.preventDefault(); send(); }}>
            <div class="mb-3">
                <label for="bot-token" class="form-label">Bot Token</label>
                <input id="bot-token" type="password" class="form-control" autocomplete="off" placeholder="123456:ABC-DEF..." bind:value={botToken} />
            </div>
            <div class="mb-3">
                <label for="chat-id" class="form-label">Chat ID</label>
                <input id="chat-id" class="form-control" placeholder="@channelname or numeric id" bind:value={chatId} />
            </div>
            <div class="mb-3">
                <label for="method" class="form-label">Method</label>
                <select id="method" class="form-select" bind:value={method} onchange={() => (file = null)}>
                    {#each Object.entries(methods) as [key, item] (key)}
                        <option value={key}>{item.label}</option>
                    {/each}
                </select>
            </div>
            <div class="mb-3">
                <label for="text" class="form-label">{method === "sendMessage" ? "Message" : "Caption"}</label>
                <textarea id="text" class="form-control" rows="3" bind:value={text}></textarea>
            </div>
            <div class="mb-3">
                <label for="parse-mode" class="form-label">Parse Mode</label>
                <select id="parse-mode" class="form-select w-auto" bind:value={parseMode}>
                    <option value="">None</option>
                    <option value="HTML">HTML</option>
                    <option value="MarkdownV2">MarkdownV2</option>
                </select>
            </div>
            {#if fileField}
                <div class="mb-3">
                    <label for="file" class="form-label">{fileField === "photo" ? "Photo" : "Document"}</label>
                    <input
                        id="file"
                        class="form-control"
                        type="file"
                        accept={methods[method].accept}
                        onchange={(e) => (file = e.currentTarget.files[0] ?? null)}
                    />
                </div>
            {/if}

            {#if error}
                <div class="alert alert-danger py-2" role="alert">{error}</div>
            {/if}

            <div>
                <button class="btn btn-primary" type="submit" disabled={sending}>
                    {sending ? "Sending..." : "Execute"}
                </button>
            </div>
        </form>
    </div>
    <div class="col-lg-6">
        <div class="mb-3">
            <OutputCard title="cURL Command" text={curl} />
        </div>
        {#if response}
            <OutputCard title="Response" text={response} filename="response.json" mime="application/json" />
        {/if}
    </div>
</div>
