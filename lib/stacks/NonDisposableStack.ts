import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { Vpc } from "../resources/Vpc";


export class NonDisposableStack extends Stack{
    constructor(scope: Construct, id: string, props?: StackProps){
        super(scope,id,props);

        const vpc = new Vpc(this);

    }
}
