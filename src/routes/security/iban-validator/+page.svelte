<script>
    import ConvertPage from "../../../components/ConvertPage.svelte";
    import { ibanReport } from "#lib/backlog.js";
</script>

<ConvertPage
    title="IBAN Validator"
    description="Check IBANs for the right country, length and check digits (mod 97). Put one IBAN on each line. Nothing leaves your browser, and a valid IBAN does not prove that the account exists."
    label="IBANs"
    placeholder={"GB82 WEST 1234 5698 7654 32\nDE89 3704 0044 0532 0130 00"}
    rows={5}
    convert={ibanReport}
    outputTitle="Result"
/>
