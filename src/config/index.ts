import { ConfigProd } from './config-prod';
import { ConfigStaging } from './config-staging';
import { Config } from './type';

let $config: Config;

if (process.env.NODE_ENV === 'production') {
	$config = new ConfigProd();
} else {
	$config = new ConfigStaging();
}

export { $config };
