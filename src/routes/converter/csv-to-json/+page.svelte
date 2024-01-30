<script>
  let csvData = '';
  let jsonData = null;
  let error = '';

  function convertToJSON() {
    try {
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',');

      jsonData = lines.slice(1).map(line => {
        const values = line.split(',');
        return headers.reduce((obj, header, index) => {
          obj[header.trim()] = values[index].trim();
          return obj;
        }, {});
      });

      error = '';
    } catch (e) {
      jsonData = null;
      error = 'Error converting CSV to JSON. Please check your CSV format.';
    }
  }
</script>

<svelte:head>
  <title>CSV to JSON Converter</title>
</svelte:head>

<h1>CSV to JSON Converter</h1>

<div>
  <label for="csv-input" class="form-label">CSV Data</label>
  <textarea bind:value={csvData} class="form-control" id="csv-input" rows="6" placeholder="Enter CSV data here"></textarea>

  <button class="btn btn-primary" on:click={convertToJSON}>Convert</button>
</div>

{#if jsonData}
  <h2>JSON Output</h2>
  <textarea class="form-control" id="json-output" rows="6" readonly>{JSON.stringify(jsonData, null, 2)}</textarea>
{:else if error}
  <p class="error">{error}</p>
{/if}
