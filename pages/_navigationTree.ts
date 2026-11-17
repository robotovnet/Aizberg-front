export default {
	link: '/dashboard',
	active: true,
	children: [
		{
			link: '/dashboard/profile',
			active: true,
		},
		{
			link: '/dashboard/modules',
			active: true,
			children: [
				{
					link: '/dashboard/modules/settings/:setting',
					active: false,
					children: [],
				},
			],

		},
		{
			link: '/dashboard/sales',
			active: false,
			children: [
				{
					link: '/dashboard/sales/one-click-order',
					active: true,
					children: [],

				},
				{
					link: '/dashboard/sales/orders',
					active: true,
					children: [{
						link: '/dashboard/sales/orders/item',
						active: true,
					},],

				},

				{
					link: '/dashboard/sales/clients',
					active: true,
					children: [],

				},

				{
					link: '/dashboard/sales/qa',
					active: true,
					children: [],

				},
			],

		},

		{
			link: '/dashboard/settings',
			active: false,
			children: [
				{
					link: '/dashboard/staff-groups',
					active: true,
					children: [
						{
							link: '/dashboard/staff-groups/item',
							active: true,
						},
					],
				},
				{
					link: '/dashboard/bonus-program',
					active: true,
					children: [
						{
							link: '/dashboard/bonus-program/item',
							active: true,
						},
					],
				},
				{
					link: '/dashboard/payment-methods',
					active: true,
					children: [
						{
							link: '/dashboard/payment-methods/item',
							active: true,
						},
					],
				},

				{
					link: '/dashboard/client-types',
					active: true,
					children: [
						{
							link: '/dashboard/client-types/item',
							active: true,
						},
					],

				},
				{
					link: '/dashboard/cities',
					active: true,
					children: [
						{
							link: '/dashboard/cities/item',
							active: true,
						},
					],

				},
				{
					link: '/dashboard/countries',
					active: true,
					children: [
						{
							link: '/dashboard/countries/item',
							active: true,
						},
					],

				},
				{
					link: '/dashboard/shops',
					active: true,
					children: [
						{
							link: '/dashboard/shops/item',
							active: true,
						},
					],

				},
				{
					link: '/dashboard/warehouses',
					active: true,
					children: [
						{
							link: '/dashboard/warehouses/item',
							active: true,
						},
					],
				},
				{
					link: '/dashboard/currencies',
					active: true,
					children: [
						{
							link: '/dashboard/currencies/item',
							active: true,
						},
					],
				},
				{
					link: '/dashboard/price-types',
					active: true,
					children: [
						{
							link: '/dashboard/price-types/item',
							active: true,
						},
					],
				},
				{
					link: '/dashboard/pickup-points',
					active: true,
					children: [
						{
							link: '/dashboard/pickup-points/item',
							active: true,
						},
					],
				},
				{
					link: '/dashboard/service-centers',
					active: true,
					children: [
						{
							link: '/dashboard/service-centers/item',
							active: true,
						},
					],
				},
				{
					link: '/dashboard/lottery',
					active: true,
					children: [
						{
							link: '/dashboard/lottery/tickets',
							active: true,
						},
						{
							link: '/dashboard/lottery/prize',
							active: true,
						},
						{
							link: '/dashboard/lottery/apps',
							active: true,
						},
						{
							link: '/dashboard/lottery/app',
							active: true,
						},
					],
				},
				{
					link: '/dashboard/postamats',
					active: true,
					children: [
						{
							link: '/dashboard/postamats/item',
							active: true,
						},
					],
				},
				{
					link: '/dashboard/delivery-cities',
					active: true,
					children: [
						{
							link: '/dashboard/delivery-cities/item',
							active: true,
						},
					],
				},
				{
					link: '/dashboard/transport-companies',
					active: true,
					children: [
						{
							link: '/dashboard/transport-companies/create',
							active: false,
						},
						{
							link: '/dashboard/transport-companies/edit/:id',
							active: true,
						},
					],

				},
				{
					link: '/dashboard/products',
					active: true,
					children: [
						{
							link: '/dashboard/products/item',
							active: false,
						},
					],

				},
				{
					link: '/dashboard/product-photos-by-articles-archive',
					active: true,
					children: [],
				},
				{
					link: '/dashboard/product-types',
					active: true,
					children: [
						{
							link: '/dashboard/product-types/item',
							active: false,
						},
					],

				},
				{
					link: '/dashboard/brands',
					active: true,
					children: [
						{
							link: '/dashboard/brands/item',
							active: false,
						},
					],

				},
				{
					link: '/dashboard/materials',
					active: true,
					children: [
						{
							link: '/dashboard/materials/item',
							active: false,
						},
					],
				},
				{
					link: '/dashboard/catalog-images',
					active: true,
					children: [
						{
							link: '/dashboard/catalog-images/item',
							active: false,
						},
					],
				},
				{
					link: '/dashboard/matrix-types',
					active: true,
					children: [
						{
							link: '/dashboard/matrix-types/item',
							active: false,
						},
					],
				},
				{
					link: '/dashboard/real-projects',
					active: true,
					children: [
						{
							link: '/dashboard/real-projects/item',
							active: false,
						},
					],
				},
				{
					link: '/dashboard/yandex-wordstat',
					active: true,
					children: [],
				},
				{
					link: '/dashboard/catalog-sections',
					active: true,
					children: [
						{
							link: '/dashboard/catalog-sections/item',
							active: false,
						}, {
							link: '/dashboard/catalog-sections/order',
							active: false,
						},
					],
				},
				{
					link: '/dashboard/tiled-catalog',
					active: true,
					children: [],

				},
				{
					link: '/dashboard/sections-one-click-order',
					active: true,
					children: [],

				},
				{
					link: '/dashboard/seo-catalog',
					active: true,
					children: [],

				},

				{
					link: '/dashboard/features',
					active: true,
					children: [
						{
							link: '/dashboard/features/item',
							active: false,
						},
					],

				},
				{
					link: '/dashboard/yml',
					active: true,
					children: [
						{
							link: '/dashboard/yml/item',
							active: false,
						},
					],

				},
				{
					link: '/dashboard/catalog-filters',
					active: true,
					children: [
						{
							link: '/dashboard/catalog-filters/create',
							active: false,
						},
						{
							link: '/dashboard/catalog-filters/edit/:id',
							active: false,
						},
					],

				},
				{
					link: '/dashboard/product-parameter-migration',
					active: true,
					children: [],
				},
				{
					link: '/dashboard/products-by-parameter',
					active: true,
					children: [],
				},
				{
					link: '/dashboard/staff',
					active: true,
					children: [
						{
							link: '/dashboard/staff/create',
							active: false,
						},
						{
							link: '/dashboard/staff/edit/:id',
							active: true,
						},

					],
				},

			],
		},
		{
			link: '/dashboard/reports',
			active: false,
			children: [
				{
					link: '/dashboard/reports/total-sales',
					active: true,
					children: [
						{
							link: '/dashboard/reports/total-sales/item',
							active: false,
						},
					],
				},
			],

		},
	],
};
