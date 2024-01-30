<script>
    export let ModalId;
    export let ModalHeader;
    export let position = 'modal-dialog-centered';
</script>

<div
    class="modal fade"
    id={ModalId}
    tabindex="-1"
    aria-labelledby="{ModalId}Label"
    aria-hidden="true"
>
    <div class="modal-dialog {position}">
        <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title fs-5" id="modal-title-1">{ModalHeader}</h1>
                <button
                    type="button"
                    class="btn-close"
                    data-bs-dismiss="modal"
                    aria-label="Close"
                />
            </div>
            <div class="modal-body">
                <slot />
            </div>
        </div>
    </div>
</div>
