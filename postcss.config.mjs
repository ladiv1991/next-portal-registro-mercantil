const config = {
  plugins: {
    "@tailwindcss/postcss": {},
    // CSS minification — install cssnano first:
    //   npm install --save-dev cssnano cssnano-preset-advanced
    // Then uncomment:
    // cssnano: {
    //   preset: ["advanced", {
    //     discardComments: { removeAll: true },
    //     normalizeWhitespace: true,
    //     minifyFontValue: true,
    //     colormin: true,
    //     reduceIdents: true,
    //     mergeLonghand: true,
    //     discardDuplicates: true,
    //     discardEmpty: true,
    //   }],
    // },
  },
};

export default config;
