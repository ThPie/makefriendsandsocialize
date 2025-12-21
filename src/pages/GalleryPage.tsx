import { useState } from 'react';

const galleryItems = [
  { title: "The Midnight Gala - Dec 2023", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAXh3-Wz1Ht5LXdzLlxBGGoD-vvkf03_EeF8VK_pPENmUgO6w_WZrOYNekTYu0QV_Bp1gpcAh8nP1L60yri9c-DzpFXGcSqzrj_4plcBFjCs7oSohyQbJYScVtpYuE9153qiPY1lNzJD2FKwHe2oXK2giczyNSKnMEKh8MZupU54kBNbVpuHP0_v3HUQiea3T_JiJN81rZJxs9rB4NCR4krlezQy19X0L_Veb8ZBFeU806KufGlpHqGOTitzHTmSjCRoY1nNixnKNqH", category: "Galas" },
  { title: "Summer Garden Party - Jul 2023", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdryPO4PJ2X7tXO92z_cw_qIKfTxU_67YSjiH_wVhXxh55rgLhUxGhQGcxoRlSbUsoXOdMY5rLl4-sd1ndRkdJqLS0F_LNsI_907Y2nZ1b4vIJmA4MUwpsSd-hmKSJU8r0qEs9GPm7n52eIv1fx-CfjA6aYME1DqymA6T22FHn9o-oK_ohaMq4sig8bQycNXUb2VhrRUyGsiOSgIxKGFHijN_VifgA5B06IYV3CTjJjGHUaNh7h9hgQ7v7O7ndK1vE5y47UrA2bJer", category: "Seasonal Soirées" },
  { title: "Art & Wine Tasting - Oct 2023", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBEwh7892z_8-C0CE1ZbCMzsXtacvkMBagOtFMpteMAs5z7gi7hA2tEIEOqQ8j-YXIVfoT_FxPufpLwnwUXwE9uxP1xduBuekiNIHwI0qkfA7MSmhY3rMB4gojuBvoMAFli5lWXu8hBVqP-EKPpC4navu4ldWgUlc_lO9ze0QxoDCzNl_rl9cF4qiJS9EEppikOfF3HXEG-bgmKw4p3hvQ__MYY8OSUF5lRdC01xAGHBnuO6VV73nHPtFZtrEdH2tvzX8ESyDvPGeY", category: "Art & Wine" },
  { title: "Holiday Ball - Dec 2023", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD8umriz-21OMC55Ayd293oQs7rnKLRq3vEyyrpgES4dNmb5KpYhHQT6M6VqPsLQoBdQHLzJrrErFkRL4LgUuXIyohI2kfyoaMKZqdzR_dc5vdfTAyyFR9XxtLxudZFC8gGVzfCMguTJeyaBflZHElhgpHY6CFEkCoJcSLux-R_hP4DQmTg9LV479oLyCsH5ygeZv2lb3yRzGyV9O82sVRmf1M6h9AkoMM7JMWBNJzz_vsNzdajQqnEuHHBtDqGMoS17l8oL4IB5039", category: "Galas" },
  { title: "Masquerade Night - Dec 2023", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBShhczH-yuHl77SAEB4GNAFHZZ63RtN8Tf6dW4odrQnX0Nfg-3f56OF5NSjc-3FUz7IgrhOepEbmBj2heEALJxF5oKejGocfigcfpK8j7Gsp1fCPhvkAk4M3e50thcSHryPSlveEUNhuFqa53v8P9CcI2r7a_nF4Ri4_S0yjTbqqPZ1EHSuMgWjrkaaEKdg92PkbjpXefCQmDpqfpDN1Umn1rnk3sXTDHBfineUzGn4MjOJCrXygvhrvmaVGhUlfwBOdQ9oJhGSVOB", category: "Galas" },
  { title: "Autumn Soirée - Sep 2023", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2NppcmiWzu8dkw4M2B5aljbZOsam4xRkIZ2GoG9NTB4DsvH8NRnRBLtrhrlXq_VVuEOoDjdIgSTtrplt4FKYcNRcQFEyuIiFl5dOHCwQQBm3o9JuR6bc8OX8gaKesl7XlVRiDeAff-l3W9EA3GevRcjDOLLWqcKuonzbROe-ditId_5tQjohrhxDXeQNC5bqjj38dccAHEH_e8BcW1ysj00sc9ysf-oCYuwgMgeVFgcoN6orHFO7aeGy6hPOC2yT5Wfj51GAw8PXN", category: "Seasonal Soirées" },
  { title: "Cocktail Hour - Nov 2023", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDWbcMhp9CnqCo04DRW5tfiu7EP13nNKERg0j0AfkB0PnVQU4VnGrjByU8E6edWXkH9LF9i8IFxbumVKxsvGa92zA2LjCoYozavuqstZNkXVAzjs_RgV8lCh6nOY6coth3yFvHlmzOGzwlSV2Z18ixJOWIdWUa-xR-AKaGKrI1lTRcEq5ykzkGVUKdS1djEtFmyNDpBQTmFjnsJkE3aVC0M_Nl1Vnx-xPkBiFzYRh1BAlTp0Cmsi0d4cw3lafg9NjhL76tYKNCEmktT", category: "Cocktail Hours" },
  { title: "Garden Brunch - Jul 2023", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD2nVkaaWk4c0OMStzn7yGMtnpn8yD4coFr_5eoDBh-oWE6kYAft0xJmaIu6XYetVRSP-HvNWbN1_OHBB1mMuLaAPK6r1ZLSW9_eCkBEXPauX7vRJlN73J_8ZeSxom5zPSHeljx8infEYJxLgJi9KJOizHeiBNjLXW_5kgyc-nzrZ1tJfEQFVAFapzaTgf_r2Jh5xBqGW01fauLh9ZZ82FBlsG1vRtjIrYkfPT8RumrjBpghoe6Ls8JL_v2bvvFNm-kfUd_c-1Tx6Ad", category: "Seasonal Soirées" },
  { title: "Winter Gala - Dec 2023", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuB_BRLhobK7o9oIZyorW5Got5wFGUYIbwMAnNkOi4S0bftAaJI_J73E1Y6pQ4VlC1HMG-BH8dhhTfTzWyqBzCL4znMVf6mCpJBwhWmfNJgyGWb3xzhmqq98gW6DTYX08FJvKr8GH80YAyM_UToxYWMHZNUrsJpbXjn0Reemm94AzOeXbQXGZxzOgc05OyuTprxoa07FM0IbUqq8hZdUGaRXx7lqN6txsXlrKrlOA5XFWVuh1IDAj8zu2PRl6zTDx36gWS3lXSfzMhwJ", category: "Galas" },
  { title: "Charity Auction - Dec 2023", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDVdLdufVJIy5BsyY7SwCwGfQH6IO48Bp4n7POJ46_HE6Fcs2j-yRwbOp6bQat80y3arSAyY1iIfE44w94Agidh5WaiwmwyRD7xPzAEe0e7xkPAdoH6ZuFDJcYnRDILnowoowPlD4oiF5U-asnt3N689BYnp9qdXzVtT6eD8MBd5EgQuIH6MfSJydmsp9-XUTs9kaTtOh6IdGfOgtgd8oQZ-ZZ4xzsDIrdWemr_PvPLuyme3PmaCCwEtapYJwuAB1qf0XFKT_TvE_pN", category: "Galas" },
  { title: "Wine Evening - Oct 2023", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAfycWlUFPdx_RZsBPyfxVh-n2TASCY9vUuKi4LUREx7rBgRCLuVQJ3FMUg3SPfgwZ_W8d6GhV6sTGUy8nahiwND3nghP7hsxLuD07OR-Cl8EdJTAE8iAfW9c7SG5_L-VQs1w4MgBbLOgTaBOBR_lv9tH_o7FkjFoJndj7SfN1KIe5zrhTYEnhMYpP4tIRNDRXU5pA2jKxqumNmchGt8uFIAVlMLBc-WIw5qe7VmGZ8S585BL804fwr-FCWu6a3TZsVBkg6ut010nBe", category: "Art & Wine" },
  { title: "Evening Soirée - Nov 2023", image: "https://lh3.googleusercontent.com/aida-public/AB6AXuDW7b1bqSx97ND046ICjHHIKcqf_e7cdCINfq0-Z1HhX4cAGMN9VIA-8WhirQNPngoc_BTweD_pdMa9f7HTMNWDKFdVH3PRejMRkII7ZPVVxqzWMsLCIvYw_D9IS7N-2A9QWAensjBeSlaauNTHuPgkzde-1Dd_h0d2bNttKeCJFjhTZF2yjCO6_FMioAoGEa5EWWhGZabvvZ5tnhns9K2U004sEwPCM2jJm3NP3_yb6ypVbXHI1Zzl1wFC-jaGoNER9tsP0piJsRB7", category: "Cocktail Hours" }
];

const GalleryPage = () => {
  const [activeCategory, setActiveCategory] = useState("All Events");
  const categories = ["All Events", "Galas", "Seasonal Soirées", "Cocktail Hours", "Art & Wine"];

  const filteredItems = activeCategory === "All Events"
    ? galleryItems
    : galleryItems.filter(item => item.category === activeCategory);

  return (
    <div className="flex-1 w-full flex flex-col items-center">
      <div className="w-full max-w-[1440px]">
        {/* Hero */}
        <div className="px-4 py-3">
          <div 
            className="bg-cover bg-center flex flex-col justify-end overflow-hidden rounded-lg min-h-80" 
            style={{
              backgroundImage: 'linear-gradient(0deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0) 25%), url("https://lh3.googleusercontent.com/aida-public/AB6AXuCvlDLnFAUBGIy5PJIrjxlFuYUiP-OgNIMHpQhXa40KTcIpzW72E3Zz1tM0FPuand9c5SsbE2sbV7A5ySDr87EXiASgXVbyqZ8ShWcyOjYV3jEH-IgtJ-S31IgOgCuqlihSprqSvQ22QtCMlkcfa8f1CGSU6DE-RYrQxg--WqM1w3z_JJRk9uf9aNNLnOR7xo9z1IOj8QgULeAvRvKv6VfUYiYpsqYVcvw2QDVIOB5q3zfAmA7xoEwZqOayWGo6PBlKRji2oquzDY9h")'
            }}
          >
            <div className="flex p-6 md:p-8">
              <h1 className="text-white tracking-tight text-4xl md:text-5xl font-bold font-display leading-tight drop-shadow-md">
                Our Celebrated Moments
              </h1>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-3 p-3 overflow-x-auto no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex h-8 shrink-0 items-center justify-center gap-x-2 rounded-lg px-4 cursor-pointer transition-colors ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'bg-muted text-muted-foreground hover:bg-muted/80'
              }`}
            >
              <span className="text-sm font-medium leading-normal whitespace-nowrap">{cat}</span>
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3 p-4">
          {filteredItems.map((item, index) => (
            <div 
              key={index} 
              className="bg-cover bg-center flex flex-col gap-3 rounded-lg justify-end p-4 aspect-[3/4] group relative overflow-hidden cursor-pointer hover:shadow-xl transition-shadow duration-300"
              style={{ backgroundImage: `url("${item.image}")` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity duration-300" />
              <p className="text-white text-base font-bold leading-tight w-full font-display relative z-10 drop-shadow-sm group-hover:-translate-y-1 transition-transform duration-300">
                {item.title}
              </p>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center p-8 gap-2">
          <button className="flex size-10 items-center justify-center text-muted-foreground hover:bg-muted rounded-full transition-colors">
            <span className="material-symbols-outlined text-lg">chevron_left</span>
          </button>
          <button className="text-sm font-bold leading-normal flex size-10 items-center justify-center text-primary-foreground bg-primary rounded-full">1</button>
          <button className="text-sm font-normal leading-normal flex size-10 items-center justify-center text-muted-foreground rounded-full hover:bg-muted transition-colors">2</button>
          <button className="text-sm font-normal leading-normal flex size-10 items-center justify-center text-muted-foreground rounded-full hover:bg-muted transition-colors">3</button>
          <span className="text-sm font-normal leading-normal flex size-10 items-center justify-center text-muted-foreground">...</span>
          <button className="text-sm font-normal leading-normal flex size-10 items-center justify-center text-muted-foreground rounded-full hover:bg-muted transition-colors">8</button>
          <button className="flex size-10 items-center justify-center text-muted-foreground hover:bg-muted rounded-full transition-colors">
            <span className="material-symbols-outlined text-lg">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default GalleryPage;
