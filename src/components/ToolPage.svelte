<script>
    export let title = "";
    export let description = "";
    export let textValue = "";
    export let textPlaceholder = "Enter your text here";
    export let textLabel = "Text";
    export let showTextarea = true;
    export let additionalInputs = [];
    export let buttons = [];
    export let outputs = [];
</script>

<svelte:head>
    <title>{title}</title>
</svelte:head>

<h1>{title}</h1>

{#if description}
    <p class="mb-3">{description}</p>
{/if}

<div class="row">
    <div class="col-md-6">
        <div class="card p-3">
            <!-- Additional inputs (for things like find/replace fields) -->
            {#each additionalInputs as input}
                <div class="mb-3">
                    <label for={input.id} class="form-label">{input.label}</label>
                    {#if input.type === 'textarea'}
                        <textarea 
                            bind:value={input.value} 
                            class="form-control" 
                            id={input.id} 
                            rows={input.rows || 3}
                            placeholder={input.placeholder || ""}
                        ></textarea>
                    {:else if input.type === 'select'}
                        <select class="form-select" id={input.id} bind:value={input.value}>
                            {#each input.options as option}
                                <option value={option.value}>{option.label}</option>
                            {/each}
                        </select>
                    {:else if input.type === 'file'}
                        <input 
                            class="form-control" 
                            type="file" 
                            id={input.id}
                            accept={input.accept || "*"}
                            on:change={input.onChange}
                        />
                    {:else if input.type === 'number'}
                        <input 
                            type="number"
                            bind:value={input.value} 
                            class="form-control" 
                            id={input.id} 
                            placeholder={input.placeholder || ""}
                        />
                    {:else if input.type === 'email'}
                        <input 
                            type="email"
                            bind:value={input.value} 
                            class="form-control" 
                            id={input.id} 
                            placeholder={input.placeholder || ""}
                        />
                    {:else if input.type === 'password'}
                        <input 
                            type="password"
                            bind:value={input.value} 
                            class="form-control" 
                            id={input.id} 
                            placeholder={input.placeholder || ""}
                        />
                    {:else}
                        <input 
                            type="text"
                            bind:value={input.value} 
                            class="form-control" 
                            id={input.id} 
                            placeholder={input.placeholder || ""}
                        />
                    {/if}
                </div>
            {/each}

            <!-- Main textarea -->
            {#if showTextarea}
                <div class="mb-3">
                    <label for="main-textarea" class="form-label">{textLabel}</label>
                    <textarea 
                        bind:value={textValue} 
                        class="form-control" 
                        id="main-textarea" 
                        rows="6" 
                        placeholder={textPlaceholder}
                        on:input
                    ></textarea>
                </div>
            {/if}

            <!-- Action buttons -->
            <div class="d-flex gap-2 flex-wrap">
                {#each buttons as button}
                    <button 
                        class="btn {button.variant || 'btn-primary'}" 
                        type="button" 
                        on:click={button.onClick}
                        disabled={button.disabled || false}
                    >
                        {button.label}
                    </button>
                {/each}
            </div>
        </div>
    </div>

    <!-- Outputs column -->
    {#if outputs.length > 0}
        <div class="col-md-6">
            {#each outputs as output}
                <div class="card p-3 mb-3">
                    <h5 class="card-title">{output.title}</h5>
                    {#if output.type === 'code'}
                        <pre class="bg-light p-2 rounded">{output.content}</pre>
                    {:else if output.type === 'stats'}
                        <div>
                            {#each output.stats as stat}
                                <p class="mb-1"><strong>{stat.label}:</strong> {stat.value}</p>
                            {/each}
                        </div>
                    {:else}
                        <p>{output.content}</p>
                    {/if}
                    {#if output.buttons}
                        <div class="d-flex gap-2 mt-2">
                            {#each output.buttons as button}
                                <button 
                                    class="btn {button.variant || 'btn-secondary'} btn-sm"
                                    on:click={button.onClick}
                                >
                                    {button.label}
                                </button>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/each}
        </div>
    {/if}
</div>
