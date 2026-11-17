/* eslint-disable */
export type OnError = (errMsg: string, errCode: number, type?: string) => void
type GetAll = (localization: string | object, onError: OnError) => Promise<object>
type GetAllWithPagination = (localization: string | object, page: string | number, tcId: string | number, method: string, onError: OnError) => Promise<object>
type GetAllProductsWithPagination = (localization: string | object, page: string | number, onPage: string | number, catalogSectionId: string | number, filterString: string, onError: OnError) => Promise<object>
type GetAllOneClickOrder = (localization: string | object, page: string, queryString: string, onError: OnError) => Promise<object>
type GetPostamats = (localization: string | object, page: string | number, city_id: string | number, transportCompanyId: string | number, adding_method: string, onError: OnError) => Promise<object>
type Get = (localization: string | object, id: string | number, onError: OnError) => Promise<object>
type Create = (localization: string | object, data: object, errorNames: string[], onError: OnError) => Promise<object>
type Update = (localization: string | object, id: string | number, data: object, errorNames: string[], onError: OnError) => Promise<object>
type Registration = (localization: string | object, data: object, errorNames: string[], onError: OnError) => Promise<object>
type Remove = (localization: string | object, id: string | number, onError: OnError) => Promise<object>
type SaveImage = (localization: string, id: string | number, data: object, onError: OnError) => Promise<object>
type SaveImageWithOrder = (localization: string, guid: string | number, order: string | number, data: object, onError: OnError, loader: any) => Promise<object>
type GetFiltersCount = (localization: string, onError: OnError) => Promise<object>
type GetAllFeatures = (localization: string, onError: OnError) => Promise<object>
type GetRelatedProductOrAnalog = (localization: string, page: string | number, queryString: string, id: string | number, onError: OnError) => Promise<object>
type Total = (localization: string | object, cityId: string | number, transportCompanyId: string | number, addingMethod: string, onError: OnError) => Promise<object>;
type UpdatePickUpPointSettings = (localization: string | object, id: string | number, data: object, onError: OnError) => Promise<object>;
type GetActiveCatalogSections = (localization: string | object, onError: OnError) => Promise<object>;
type SetActiveCatalogSections = (localization: string | object, data: object, onError: OnError) => Promise<object>;
type GetSimilar = (localization: string | object, data: object, onError: OnError) => Promise<object>;
type SetSubscribers = (localization: string | object, data: object, onError: OnError) => Promise<object>;
type GetSubscribers = (localization: string | object, onError: OnError) => Promise<object>;
type SetSections = (localization: string | object, data: object, onError: OnError) => Promise<object>;
type GetSections = (localization: string | object, onError: OnError) => Promise<object>;
type TotalCities = (localization: string | object, tcId: string | number, method: string, onError: OnError) => Promise<object>;
type GetSectionsOfMaterials = (localization: string | object, onError: OnError) => Promise<object>;
type GetBlockedSections = (localization: string, onError: OnError) => Promise<object>
type GetCitiesWithClients = (localization: string, onError: OnError) => Promise<object>
type SetBlockedSections = (localization: string, data: object, onError: OnError) => Promise<object>
type GetBlockedSectionsForPaymentsMethods = (localization: string, id: string | number, onError: OnError) => Promise<object>
type SetBlockedSectionsForPaymentsMethods = (localization: string, id: string | number, data: object, onError: OnError) => Promise<object>
type GetEstimatedNumber = (localization: string, onError: OnError) => Promise<object>
type SetEstimatedNumber = (localization: string, id: string | number, data: object, onError: OnError) => Promise<object>
type ChangeTrackNumber = (localization: string, id: string | number, data: object, onError: OnError) => Promise<object>
type ChangeOrderMethod = (localization: string, id: string | number, data: object, onError: OnError) => Promise<object>
type ChangeOrderStatus = (localization: string, id: string | number, data: object, onError: OnError) => Promise<object>
type GetAllinCountryWithPagination = (localization: string | object, page: string | number, code: string, onError: OnError) => Promise<object>
type TotalCitiesInCountry = (localization: string | object, code: string, onError: OnError) => Promise<object>;
type TotalProducts = (localization: string | object, sectionId: string | number, filterString: string, onError: OnError) => Promise<object>;
type RemovePhoto = (localization: string | object, photoName: string | number, onError: OnError) => Promise<object>;
type SetOrder = (localization: string | object, data: object, onError: OnError) => Promise<object>;
type GetClientsWithFilters = (localization: string | object, page: string | number, queryString: string, onError: OnError) => Promise<object>;
type TotalClients = (localization: string | object, filterString: string, onError: OnError) => Promise<object>;
type TotalOneClickOrders = (localization: string | object, queryString: string, onError: OnError) => Promise<object>;
type ChangeOrder = (localization: string | object, data: object, onError: OnError) => Promise<object>;
type GetProductMatrixTypeId = (localization: string | object, id: string | number, onError: OnError) => Promise<object>;
type GetTasksInWork = (localization: string, onError: OnError) => Promise<any>;
type UploadExcel = (localization: string, file: File, onError: OnError) => Promise<any>;
type GetBalance = (localization: string, onError: OnError) => Promise<any>;
type ClearStatistics = (localization: string, onError: OnError) => Promise<any>;
type ClearJobs = (localization: string, onError: OnError) => Promise<any>;
type GetValues = (localization: string | object, featureId: string | number, onError: OnError) => Promise<object>;
type MigrateValues = (localization: string | object, data: object, errorNames: string[], onError: OnError) => Promise<object>;
type GetProductsByValue = (localization: string | object, featureId: string | number, data: object, errorNames: string[], onError: OnError) => Promise<object>;

interface ApiService {
	getAll: GetAll,
	get: Get,
	create: Create,
	update: Update,
	remove: Remove,
}

interface ClientsService {
	getAll: GetAll,
	getAllWithFilters: GetClientsWithFilters,
	total: TotalClients,
	get: Get,
	update: Update,
	registration: Registration,
	remove: Remove,
	getCitiesWithClients: GetCitiesWithClients;
}
interface TransportCompaniesService {
	getAll: GetAll,
	get: Get,
	create: Create,
	update: Update,
	remove: Remove,
	sort: '',
	updatePickUpPointSettings: '',
	getCitiesWitPickUpPoints: '',
	getCitiesWithPostamatss: '',

}

interface OrdersService {
	getAll: GetAll,
	get: Get,
	changeTrackNumber: ChangeTrackNumber,
	changeOrderMethod: ChangeOrderMethod,
	changeOrderStatus: ChangeOrderStatus,
	getAllWithFilters: GetClientsWithFilters,
	thanksFeedback: any,
	changePaymentStatus: any,
	total: TotalClients,
}

interface PostamatsService extends ApiService {
	getItems: GetPostamats,
	getCities: GetAll,
	total: Total,
	updatePickUpPointSettings: UpdatePickUpPointSettings,
}

interface PaymentService extends ApiService {
	setOrder: SetOrder,
	getBlockedSections: GetBlockedSectionsForPaymentsMethods,
	setBlockedSections: SetBlockedSectionsForPaymentsMethods,
}

interface BonusProgramService extends ApiService {
	getBlockedSections: GetBlockedSections,
	setBlockedSections: SetBlockedSections,
	getEstimatedNumber: GetEstimatedNumber,
	setEstimatedNumber: SetEstimatedNumber,
}

interface MaterialsService extends ApiService {
	getSectionsOfMaterials: GetSectionsOfMaterials,

}

interface ApiServiceWithPagination extends ApiService {
	getAllWithPagination: GetAllWithPagination,
	totalCities: TotalCities,
}

interface Cities extends ApiServiceWithPagination {
	getAllinCountryWithPagination: GetAllinCountryWithPagination,
	totalCitiesInCountry: TotalCitiesInCountry
}

interface ApiServiceWithImageSaving extends ApiService {
	saveImage: SaveImage;
}
interface CatalogSectionsService extends ApiService {
	saveImage: SaveImage;
	changeOrder: ChangeOrder
}

interface ApiProductService extends ApiService {
	getSimilar: GetSimilar,
	getAllWithPagination: GetAllProductsWithPagination,
	saveImage: SaveImage;
	saveImageWithOrder: SaveImageWithOrder;
	getRelatedProductOrAnalog: GetRelatedProductOrAnalog;
	total: TotalProducts,
	removePhoto: RemovePhoto,
}

interface ApiServiceWithFiltersCount extends ApiService {
	getFiltersCount: GetFiltersCount;
}

interface ApiServiceWithFeatures extends ApiService {
	getAllFeatures: GetAllFeatures;
}

interface CatalogFeaturesService extends ApiService {
	getValues: GetValues;
	migrateValues: MigrateValues;
	getProductsByValue: GetProductsByValue;
}

interface OneClickOrder {
	getAll: GetAllOneClickOrder;
	getActiveCatalogSections: GetActiveCatalogSections;
	setActiveCatalogSections: SetActiveCatalogSections;
	setSubscribers: SetSubscribers;
	getSubscribers: GetSubscribers;
	total: TotalOneClickOrders,
}

interface YandexYml extends ApiService {
	setSections: SetSections;
	getSections: GetSections;
}

interface MatrixTypesService extends ApiService {
	getProductMatrixTypeId: GetProductMatrixTypeId;
}

interface YandexWordstatService {
	getTasksInWork: GetTasksInWork;
	uploadExcel: UploadExcel;
	getBalance: GetBalance;
	clearStatistics: ClearStatistics;
	clearJobs: ClearJobs;
}

export {
	CatalogSectionsService,
	PostamatsService,
	ApiService,
	ApiServiceWithImageSaving,
	ApiServiceWithFiltersCount,
	ApiProductService,
	ApiServiceWithFeatures,
	ApiServiceWithPagination,
	BonusProgramService,
	Cities,
	ClientsService,
	MaterialsService,
	OneClickOrder,
	OrdersService,
	YandexYml,
	PaymentService,
	MatrixTypesService,
	YandexWordstatService,
	CatalogFeaturesService,
};
