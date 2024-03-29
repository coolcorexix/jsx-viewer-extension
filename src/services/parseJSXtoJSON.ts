
type ISouceLocation = Partial<{
    start: {
        line: number;
        column: number;
    },
    end: {
        line: number;
        column: number;
    },
}>;

interface INode {
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
    otherThanChildrenProps: string;
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
    } = parentNode;
    const rs: IOutputJSON = {
        id: assignedId,
        type,
        sourceLocation,
        otherThanChildrenProps: '',
    };
    if (props) {
        Object.keys(props).forEach(key => {
            if (key !== 'children' && props[key]) {
                rs.otherThanChildrenProps += `${key}: ${props[key]}, `;
            }
        });
    }
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