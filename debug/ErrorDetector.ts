import { error_internal_list } from "../lib/i18n";

let ErrDetector = (db_type: string, table_name: string, line: number) => {
    console.log(`${error_internal_list.FAILED_UPSERT_DB} ${db_type}---${table_name}`);
    console.log(`${error_internal_list.FAILED_LINE} ${line}`);
}


export default ErrDetector;