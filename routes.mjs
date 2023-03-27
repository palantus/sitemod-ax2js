routes.push(...[
  {path: "/axadmin",            page: "/pages/ax-admin.mjs"},
  {path: "/ax",                 page: "/pages/ax.mjs"},

  //Place regexp pages last, to ensure fast routing of those without:
  {regexp: /\/ax\/([a-zA-Z\_0-9]+)/,page: "../pages/ax.mjs"},
])