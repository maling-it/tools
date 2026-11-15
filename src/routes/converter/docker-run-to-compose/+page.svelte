<script>
    import ConvertPage from "../../../components/ConvertPage.svelte";
    import { dockerRunToComposeText } from "#lib/backlog.js";
</script>

<ConvertPage
    title="Docker Run to Compose"
    description="Turn a docker run command into a docker-compose.yml. Ports, volumes, environment, restart policy, networks and the command are kept. Options that have no Compose equivalent are listed as notes."
    label="docker run command"
    placeholder={"docker run -d --name web -p 8080:80 -v data:/data -e MODE=prod --restart unless-stopped nginx:latest"}
    rows={5}
    convert={dockerRunToComposeText}
    outputTitle="docker-compose.yml"
    filename="docker-compose.yml"
    mime="text/yaml"
/>
