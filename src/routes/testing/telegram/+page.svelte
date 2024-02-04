<script>
    let botToken = "";
    let messageText = "";
    let chatId = "";
    let selectedOption = "sendMessage";
    let responseMessage = "";
    let photoFile = null;
    let documentFile = null;

    const sendMessage = async () => {
        try {
            let formData = new FormData();

            if (selectedOption === "sendMessage") {
                formData.append("chat_id", chatId);
                formData.append("text", messageText);
            } else if (selectedOption === "sendPhoto") {
                formData.append("chat_id", chatId);
                formData.append("photo", photoFile);
                formData.append("caption", messageText);
            } else if (selectedOption === "sendDocument") {
                formData.append("chat_id", chatId);
                formData.append("document", documentFile);
                formData.append("caption", messageText);
            }

            const response = await fetch(
                `https://api.telegram.org/bot${botToken}/${selectedOption}`,
                {
                    method: "POST",
                    body: formData,
                },
            );

            const data = await response.json();
            responseMessage = JSON.stringify(data, null, 2);
        } catch (error) {
            responseMessage = `Error: ${error.message}`;
        }
    };

    const getCurlCommand = () => {
        let curlCommand = "";

        if (selectedOption === "sendMessage") {
            curlCommand = `curl -X POST -H "Content-Type: application/json" -d '{"chat_id": "${chatId}", "text": "${messageText}"}' https://api.telegram.org/bot${botToken}/${selectedOption}`;
        } else if (selectedOption === "sendPhoto") {
            curlCommand = `curl -X POST -H "Content-Type: multipart/form-data" -F "chat_id=${chatId}" -F "photo=@${photoFile.name}" -F "caption=${messageText}" https://api.telegram.org/bot${botToken}/${selectedOption}`;
        } else if (selectedOption === "sendDocument") {
            curlCommand = `curl -X POST -H "Content-Type: multipart/form-data" -F "chat_id=${chatId}" -F "document=@${documentFile.name}" -F "caption=${messageText}" https://api.telegram.org/bot${botToken}/${selectedOption}`;
        }

        navigator.clipboard.writeText(curlCommand);
        alert("Curl command copied to clipboard!");
    };
</script>

<svelte:head>
    <title>Telegram Bot Testing</title>
</svelte:head>
<h1 class="title text-center mb-3">Telegram Bot Testing</h1>
<div class="row">
    <div class="col-md-6">
        <div class="card p-3">
            <input
                class="form-control mb-3"
                placeholder="BOT TOKEN"
                bind:value={botToken}
            />
            <input
                class="form-control mb-3"
                placeholder="CHAT ID"
                bind:value={chatId}
            />
            <input
                class="form-control mb-3"
                placeholder="MESSAGE"
                bind:value={messageText}
            />
            <div class="mb-3">
                <select
                    class="form-select"
                    id="example-select-1"
                    bind:value={selectedOption}
                >
                    <option value="sendMessage">Send Message</option>
                    <option value="sendPhoto">Send Photo</option>
                    <option value="sendDocument">Send Document</option>
                </select>
            </div>

            {#if selectedOption === "sendPhoto"}
                <div class="mb-3">
                    <label for="images" class="form-label"
                        >Upload Photo</label
                    >
                    <input
                        class="form-control"
                        type="file"
                        id="images"
                        accept="image/*"
                        on:change={(e) => (photoFile = e.target.files[0])}
                    />
                </div>
            {/if}

            {#if selectedOption === "sendDocument"}
            <div class="mb-3">
                <label for="doc" class="form-label"
                    >Upload Document</label
                >
                <input
                    class="form-control"
                    type="file"
                    id="doc"
                    on:change={(e) => (documentFile = e.target.files[0])}
                />
            </div>
            {/if}

            <button class="btn btn-primary" on:click={sendMessage}>Execute</button>
        </div>
    </div>
    <div class="col-md-6">

    {#if responseMessage}
    <div class="card p-3">
        <h2 class="card-title">Response:</h2>
        <pre>{responseMessage}</pre>
        <button class="btn btn-primary" on:click={getCurlCommand}>Copy Curl Command</button>
    </div>
{/if}
    </div>
</div>