interface ISouceLocation  {
    line: number;
    column: number;
};

interface INode {
    id: number;
    type: string;
    sourceLocation: ISouceLocation;
    props: {
        children: any;
        [key: string]: any;
    };
}

export type IOutputJSON = {
    id: number;
    type: string;
    sourceLocation: ISouceLocation;
    nested?: IOutputJSON[];
};

let assignedId = 0;

export function parseJSXtoJSON(parentNode: INode): IOutputJSON {
    assignedId++;
    const {
        type,
        sourceLocation,
        props,
    } =  parentNode;
    const rs: IOutputJSON = {
        id: assignedId,
        type,
        sourceLocation,
    };
    if (props && props.children) {
        props.children.forEach((child: any) => {
            if (!!child.type) {
                if (!rs.nested) {
                    rs.nested = [];
                }
                rs.nested.push(parseJSXtoJSON(child));
            }
        });
    } 
    
    return rs;
}