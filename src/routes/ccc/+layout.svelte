<script lang="ts">
    import {page} from "$app/stores";
</script>

<style lang="scss">
#login-info {
    z-index: 1000000;

    position: fixed;
    top: 4rem;
    right: 0;
    left: 0;

    #login-info-content {
        width: 50%;

        margin: 0 auto;
        height: 2rem;
        line-height: 2rem;

        background: var(--accentblack);
        border-radius: 0 0 5rem 5rem;

        font-size: var(--text-size);
        text-align: center;
        color: white;

        .name {
            color: var(--accentlighter);
            font-weight: bold;
        }

        a {
            font-style: normal;
            color: var(--accentmedium);
        }
    }
}
</style>

{#if $page.data?.session?.user}
<div id="login-info">
    <div id="login-info-content">
        Logged in as <span class="name">{$page.data.session.user.name}</span> •
        <a href="/ccc/login">Log out</a>
    </div>
</div>
{/if}

<slot/>