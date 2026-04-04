import {defineConfig} from "orval";

export default defineConfig({
    timeWarden: {
        input: {
            target: "http://localhost:5062/openapi/v1.json",
        },
        output: {
            mode: "tags-split",
            target: "src/api/generated",
            schemas: "src/api/generated/models",
            client: "react-query",
            httpClient: "fetch",
            baseUrl: "http://localhost:5062",
            override: {
                mutator: {
                    path: "src/api/mutator/custom-instance.ts",
                    name: "customInstance",
                },
                query: {
                    useQuery: true,
                    useMutation: true,
                },
            },
        },
    },
});