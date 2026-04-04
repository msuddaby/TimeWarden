import {createFileRoute} from '@tanstack/react-router'

export const Route = createFileRoute('/invoices/')({
    component: InvoicesRoute,
})

function InvoicesRoute() {

    return <div>Hello "/invoices/"!</div>
}
