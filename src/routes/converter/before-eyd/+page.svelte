<script>
    let inputSentence = '';
    let convertedSentence = '';
  
    function convertToCustomSpelling() {
      let text = inputSentence;
  
      const conversionMap = {
        'j': 'dj',
        'y': 'j',
        'c': 'tj',
        'u': 'oe',
        'ny': 'nj',
        'sy': 'sj',
        'kh': 'ch',
        'J': 'Dj',
        'C': 'Tj',
        'U': 'Oe',
        'Ny': 'Nj',
        'Sy': 'Sj',
        'Kh': 'Ch',
      };
  
      Object.keys(conversionMap).forEach(key => {
        const regex = new RegExp(key, 'g');
        text = text.replace(regex, conversionMap[key]);
      });
  
      convertedSentence = text;
    }
  </script>
  
  <svelte:head>
    <title>Indonesian Spelling Converter</title>
  </svelte:head>
  
  <h1>Indonesian Spelling Converter</h1>
  
  <div>
    <label for="sentence-input" class="form-label">Regular Indonesian Sentence</label>
    <textarea bind:value={inputSentence} class="form-control" id="sentence-input" rows="6" placeholder="Enter a sentence"></textarea>
  
    <button class="btn btn-primary" on:click={convertToCustomSpelling}>Convert</button>
  </div>
  
  {#if convertedSentence}
    <h2>Converted Spelling</h2>
    <textarea bind:value={convertedSentence} class="form-control" id="converted-output" rows="6" readonly></textarea>
  {/if}
  