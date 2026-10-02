<script>
  import cloudLogo from "@cloud-ui/shared/assets/cloud-ui.svg";
  import "../style.css";
  const { children } = $props();
</script>

<header class="shell-header">
  <img src={cloudLogo} class="framework" alt="" width="48" height="48" />
  <h1>CloudUI</h1>
</header>

{@render children()}
