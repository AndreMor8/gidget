module.exports = {
    checkCommandModule: (cmdName, cmdModule) => {
        if (!cmdModule.hasOwnProperty('run'))
            throw new Error(`${cmdName} command module does not have property 'run'`);
        if (!cmdModule.hasOwnProperty('description'))
            throw new Error(`${cmdName} command module does not have property 'description'`);
        if (!cmdModule.hasOwnProperty('aliases'))
            throw new Error(`${cmdName} command module does not have property 'aliases'`);
        if (!cmdModule.hasOwnProperty("owner")) {
            if (!cmdModule.hasOwnProperty('permissions'))
                throw new Error(`${cmdName} command module does not have property 'permissions'`);
        }
        return true;
    },
    checkProperties: (cmdName, cmdModule) => {
        if (typeof cmdModule.run !== 'function')
            throw new Error(`${cmdName} command: run is not a function`);
        if (typeof cmdModule.description !== 'string' || !cmdModule.description)
            throw new Error(`${cmdName} command: description is not a string`);
        if (!Array.isArray(cmdModule.aliases))
            throw new Error(`${cmdName} command: aliases is not an Array`);
        if (!cmdModule.hasOwnProperty("owner")) {
            if (typeof cmdModule.permissions !== 'object' || !cmdModule.permissions)
                throw new Error(`${cmdName} command: permissions is not a object`);
            if (!cmdModule.permissions.hasOwnProperty('user'))
                throw new Error(`${cmdName} command module does not have property 'permissions.user'`);
            if (!cmdModule.permissions.hasOwnProperty('bot'))
                throw new Error(`${cmdName} command module does not have property 'permissions.bot'`);
            if (!Array.isArray(cmdModule.permissions.user))
                throw new Error(`${cmdName} command: permissions.user is not a array`);
            if (!Array.isArray(cmdModule.permissions.bot))
                throw new Error(`${cmdName} command: permissions.bot is not a array`);
        }
        return true;
    }
}