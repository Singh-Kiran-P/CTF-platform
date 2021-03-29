<template>
  <div>
    <b-navbar toggleable="md" type="light" variant="light" fixed="top">
      <b-navbar-brand :to="{ path: '/' }">
        <img src="" width="25" />
        CTF
      </b-navbar-brand>

      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav>
          <b-nav-item :to="{ path: '/' }" data-cy="nav-bar-home"
            >Home</b-nav-item
          >
          <b-nav-item :to="{ path: '/about' }" data-cy="nav-bar-todo"
            >About</b-nav-item
          >
          <b-nav-item
            :to="{ path: '/another-page' }"
            data-cy="nav-bar-another-page"
            >Another Page</b-nav-item
          >
          <b-nav-item-dropdown
            data-cy="nav-bar-sample-page"
            text="Sample Page"
            right
          >
            <b-dropdown-item
              :to="{ path: '/sample-page/1' }"
              data-cy="nav-bar-sample-page-1"
              >Page 1</b-dropdown-item
            >
            <b-dropdown-item
              :to="{ path: '/sample-page/2' }"
              data-cy="nav-bar-sample-page-2"
              >Page 2</b-dropdown-item
            >
          </b-nav-item-dropdown>
        </b-navbar-nav>

        <!-- Right aligned nav items -->

        <b-navbar-nav class="ml-auto">
          <b-nav-item
            :to="{ path: '/login' }"
            data-cy="nav-bar-login"
            link-classes="btn btn-info text-light mx-1"
            >Login</b-nav-item
          >
          <b-nav-item
            :to="{ path: '/register' }"
            data-cy="nav-bar-register"
            link-classes="btn btn-primary mx-1 text-light"
            >Sign up</b-nav-item
          >
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>

</script>
