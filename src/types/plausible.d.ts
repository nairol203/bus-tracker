export interface PlausibleResponse {
    results: Result[];
    meta:    Meta;
    query:   Query;
}

export interface Meta {
}

export interface Query {
    site_id:    string;
    metrics:    string[];
    date_range: Date[];
    filters:    any[];
    dimensions: string[];
    order_by:   Array<string[]>;
    include:    Meta;
    pagination: Pagination;
}

export interface Pagination {
    offset: number;
    limit:  number;
}

export interface Result {
    metrics:    number[];
    dimensions: string[];
}
