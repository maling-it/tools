<script>
    import ModalBody from "../components/ModalBody.svelte";
    import ModalBtn from "../components/ModalBtn.svelte";
</script>

<svelte:head>
    <title>Home</title>
</svelte:head>

<h1>Welcome to SvelteKit</h1>
<p>
    <ModalBtn ModalId="myModal" modalName="Open Modal" />

    <ModalBody ModalId="myModal" ModalHeader="Hello WOrld">Content of the body</ModalBody>
    Visit <a href="https://kit.svelte.dev">kit.svelte.dev</a> to read the documentation
</p>
