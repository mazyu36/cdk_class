export type VpcConfig = {
    networkAddress: string
}

export function getVpcConfig(env: string): VpcConfig {
    switch (env) {
        case 'dev':
            return {
                networkAddress: '10.0.'
            }
        case 'stg':
            return {
                networkAddress: '10.1.'
            }
        case 'prd':
            return {
                networkAddress: '10.2.'
            }
        default:
            throw new Error(
                'Context value env is invalid (use "dev" or "stg" or "prd")'
            )
    }
}